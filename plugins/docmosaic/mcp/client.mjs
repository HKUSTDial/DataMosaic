import { constants } from 'node:fs';
import { open, realpath } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const MAX_PDF_BYTES = 50 * 1024 * 1024;
const FILE_NAME = /^mosaic-[a-f0-9-]{36}-[^/\\]+\.pdf$/i;
export const SESSION_ID = /^mosaic-[a-f0-9-]{36}$/;

export class DocMosaicClient {
  constructor(env = process.env) {
    const url = new URL(env.DOCPILOT_URL || 'http://127.0.0.1:8008');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error('DOCPILOT_URL must be an HTTP(S) service URL without credentials, query or fragment.');
    }
    this.baseUrl = url.href.replace(/\/$/, '');
    this.workspace = env.DOCMOSAIC_WORKSPACE_ROOT || process.cwd();
    this.env = env;
  }

  async request(endpoint, options = {}, signal) {
    let response;
    try {
      const timeout = AbortSignal.timeout(options.timeout ?? 120_000);
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options, redirect: 'error', signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error('DocMosaic service is unreachable or timed out. Check DOCPILOT_URL and the service logs; no automatic retry was made.');
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`DocMosaic returned HTTP ${response.status}. Check the service logs; no automatic retry was made.`);
    }
    return response;
  }

  async documents(sessionId, signal) {
    const response = await this.request(`/api/files?${new URLSearchParams({ session_id: sessionId })}`, {}, signal);
    const body = await response.json();
    if (!Array.isArray(body.files)) throw new Error('DocMosaic returned an invalid document list.');
    return body.files.filter(file => FILE_NAME.test(file.name)).map(file => ({
      name: file.name, doc_id: file.doc_id, size: file.size,
      processing_status: file.processing_status,
      processing_failed: file.processing_status === 'failed',
    }));
  }

  async upload(filePath, sessionId = `mosaic-${randomUUID()}`, signal) {
    const [root, resolved] = await Promise.all([realpath(this.workspace), realpath(filePath)]);
    const relative = path.relative(root, resolved);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error('The PDF must be inside DOCMOSAIC_WORKSPACE_ROOT.');
    }
    if (path.extname(resolved).toLowerCase() !== '.pdf') throw new Error('Only PDF files are supported.');
    const handle = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW);
    let data;
    try {
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size > MAX_PDF_BYTES) throw new Error('Choose a regular PDF file no larger than 50 MiB.');
      data = await handle.readFile();
      if (data.length > MAX_PDF_BYTES || data.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF file or PDF exceeds 50 MiB.');
    } finally {
      await handle.close();
    }
    const originalName = path.basename(resolved);
    const name = `mosaic-${randomUUID()}-${originalName.replace(/[^\p{L}\p{N}._-]/gu, '_').slice(-100)}`;
    const form = new FormData();
    form.append('files', new Blob([data], { type: 'application/pdf' }), name);
    const response = await this.request(`/api/files?${new URLSearchParams({ session_id: sessionId })}`, {
      method: 'POST', body: form,
    }, signal);
    const body = await response.json();
    if (!Array.isArray(body.uploaded) || !body.uploaded.includes(name)) throw new Error('DocMosaic did not accept the PDF.');
    return { session_id: sessionId, name, original_name: originalName,
      documents: await this.documents(sessionId, signal) };
  }

  async ask({ session_id, files, question }, signal, onProgress) {
    if (!this.env.DOCPILOT_MODEL?.trim()) throw new Error('Set DOCPILOT_MODEL in the plugin environment before asking a question.');
    const provider = this.env.DOCPILOT_PROVIDER || 'custom';
    if (!['custom', 'vllm'].includes(provider)) throw new Error('DOCPILOT_PROVIDER must be custom or vllm.');
    const documents = await this.documents(session_id, signal);
    for (const name of files) {
      const document = documents.find(item => item.name === name);
      if (!document || document.processing_status !== 'ready') {
        throw new Error('A selected PDF is missing or not ready. Check list_documents; no analysis was started.');
      }
    }
    const conversationId = randomUUID();
    let answer = '', state = {}, artifacts = {}, done = false;
    const fail = message => Object.assign(new Error(message), {
      run: { session_id, conversation_id: conversationId, artifacts },
    });
    let response;
    try {
      response = await this.request('/api/chat/stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, timeout: 3_600_000,
        body: JSON.stringify({
          session_id, conversation_id: conversationId, agent: 'default', selected_files: files,
          config: { provider, model: this.env.DOCPILOT_MODEL,
            base_url: this.env.DOCPILOT_MODEL_BASE_URL || 'https://api.openai.com/v1',
            api_key: this.env.DOCPILOT_API_KEY || '', reasoning: this.env.DOCPILOT_REASONING === 'true',
            temperature: 0, timeout: 180 },
          messages: [{ role: 'user', content: question }],
        }),
      }, signal);
    } catch (error) {
      throw fail(error.message);
    }
    const accept = async event => {
      if (event.artifacts) artifacts = { ...artifacts, ...event.artifacts };
      if (event.type === 'error') throw fail('DocMosaic analysis failed. Check the service logs; the request was not retried.');
      if (event.state) state = event.state;
      if (event.type === 'delta') answer += event.content || '';
      if (event.type === 'step') await onProgress?.(event.step_index);
      if (event.type === 'done') done = true;
    };
    // DocPilot streams NDJSON; decode incrementally so split UTF-8 characters survive.
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let pending = '';
    try {
      if (!response.body) throw new Error('DocMosaic returned no analysis stream.');
      for await (const chunk of response.body) {
        pending += decoder.decode(chunk, { stream: true });
        if (pending.length > 8 * 1024 * 1024) throw new Error('DocMosaic analysis event exceeds 8 MiB.');
        let newline;
        while ((newline = pending.indexOf('\n')) !== -1) {
          const line = pending.slice(0, newline).trim();
          pending = pending.slice(newline + 1);
          if (line) await accept(JSON.parse(line));
        }
      }
      pending += decoder.decode();
      if (pending.trim()) await accept(JSON.parse(pending));
    } catch (error) {
      if (signal?.aborted) throw error;
      throw fail(error.message.startsWith('DocMosaic') ? error.message
        : 'DocMosaic returned an invalid or interrupted analysis stream; the request was not retried.');
    }
    if (!done || !answer.trim()) throw fail('DocMosaic stream ended without a completed answer; the request was not retried.');
    const ids = state.candidate_answer?.supporting_evidence_ids || [];
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw fail('DocMosaic returned invalid evidence IDs.');
    const store = state.evidence_store ?? {};
    const hasEvidence = id => Object.hasOwn(store, id) && store[id] && typeof store[id] === 'object';
    const evidence = ids.filter(hasEvidence).map(id => {
      const item = store[id];
      const docId = item.provenance?.doc_id;
      const document = docId ? documents.find(doc => doc.doc_id === docId) : undefined;
      const text = typeof item.content === 'string' ? item.content : JSON.stringify(item.content ?? '');
      return { evidence_id: id, node_id: item.node_id, page: item.page, modality: item.modality,
        source_file: document?.name ?? null,
        source_url: document ? `${this.baseUrl}/api/files/content/${encodeURIComponent(document.name)}?${new URLSearchParams({ session_id })}#page=${item.page}` : null,
        excerpt: text.slice(0, 2000), excerpt_truncated: text.length > 2000 };
    });
    return { session_id, conversation_id: conversationId, answer,
      supporting_evidence_ids: ids, evidence,
      unresolved_evidence_ids: ids.filter(id => !hasEvidence(id)),
      verification: state.verification ?? null, artifacts };
  }
}
