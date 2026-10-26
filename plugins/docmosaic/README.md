# DocMosaic plugin

DocMosaic is an installable DeepSeek Harness bundle containing a standard MCP
stdio server and a document-analysis Skill. It calls the existing DocPilot
backend; it does not copy, start, or modify any DataMosaic engine.

This first version supports PDF questions and evidence navigation. DBMosaic and
OntoMosaic are separate applications and are not included.

## Requirements

- Node.js 24.9 or newer for the DSH bundle.
- pnpm available on `PATH` for the DSH CLI's plugin installation command
  (verified with pnpm 11.28.5).
- DeepSeek Harness **0.2.1-rc.2**. The bundle pins its DSH adapter dependencies
  and declares this exact host version; update and retest them together.
- An existing DocPilot service with PDF preprocessing configured. The local
  DataMosaic stack exposes it at `http://127.0.0.1:8008` by default. A portal URL
  ending in `/docmosaic` also works if it proxies the native `/api/files` and
  `/api/chat/stream` endpoints.
- The backend model's configuration available to the MCP server. This is
  independent of the model selected in DSH.

## Install in DeepSeek Harness

Run from the DataMosaic repository root. These commands install only this bundle;
start the existing application stack separately when needed.

```sh
npm --prefix plugins/docmosaic ci
npx @deepseek-ai/dsh@0.2.1-rc.2 plugin --profile web add "$(pwd)/plugins/docmosaic"
```

Launch the host with an explicit upload root and, if desired, the existing portal
`.env` file. No file is automatically loaded or copied:

```sh
DOCMOSAIC_WORKSPACE_ROOT="$(pwd)" \
DOCMOSAIC_ENV_FILE="$(pwd)/.env" \
npx @deepseek-ai/dsh@0.2.1-rc.2 web
```

The plugin appears as **DocMosaic** in the host's Plugins page. Its bundled
`docmosaic` Skill is registered without modifying the user's global skill
folders. MCP tools appear under `mcp__docmosaic__*`. The backend need not be
running for tool discovery; it must be reachable before uploading or analyzing.

Ask, for example:

> Use DocMosaic to analyze `examples/analyze/MADQA/dev-48/24788195.pdf`, explain its main conclusion,
> and cite the source pages. Use only this PDF.

Use an actual PDF path inside the chosen workspace. Each upload creates an
isolated session unless an existing plugin session ID is explicitly supplied.

## Configuration

Settings come from the DSH process environment. The plugin explicitly forwards
these names through the MCP client's scrubbed child environment. If
`DOCMOSAIC_ENV_FILE` is set, the MCP process additionally loads that file using
Node's native env-file support; existing environment values take precedence.

| Variable | Default / purpose |
|---|---|
| `DOCMOSAIC_WORKSPACE_ROOT` | Host launch directory; local PDF uploads must resolve inside it. |
| `DOCMOSAIC_ENV_FILE` | Optional absolute path to an existing model env file. |
| `DOCPILOT_URL` | `http://127.0.0.1:8008`; native service or compatible proxy base URL. |
| `DOCPILOT_MODEL` | Required for analysis; no model is silently chosen. |
| `DOCPILOT_PROVIDER` | `custom`; also supports the backend's `vllm` provider. |
| `DOCPILOT_MODEL_BASE_URL` | `https://api.openai.com/v1`; the backend model endpoint. |
| `DOCPILOT_API_KEY` | Backend model credential; never passed as a tool argument. |
| `DOCPILOT_REASONING` | `false`; set to `true` to enable backend reasoning. |

For a remote backend, the PDF bytes are uploaded over its configured HTTP(S)
connection. The model configuration is sent to that backend when analysis starts.
Use a backend you control, with HTTPS for network transport outside a trusted
local connection. The wrapper adds no authentication layer to the existing
backend.

## MCP tools

| Tool | Input | Result |
|---|---|---|
| `upload_document` | Local `path`, optional `session_id` | Unique file name, session ID, parsing status. |
| `list_documents` | `session_id` | Uploaded file names, document IDs and parsing status. |
| `ask_document` | `session_id`, explicit `files`, `question` | Answer, cited evidence, verification and backend run references. |

Only regular PDFs up to 50 MiB are accepted. Symlinks resolving outside the
upload root are rejected. Uploaded names include a UUID so same-name PDFs do not
overwrite one another. Only `ready` files are sent to the agent.

`ask_document` uses `agent: default` and consumes the native NDJSON stream,
including its final evidence state. It does not use the portal's simplified
analysis stream. Each question is a new analysis; include relevant follow-up
context in `question`.

Evidence preserves the backend's IDs, node IDs, page numbers and modalities.
`excerpt` is capped at 2,000 characters with an explicit `excerpt_truncated` flag.
Unknown source mappings remain null and missing evidence IDs are returned in
`unresolved_evidence_ids`. Backend verification is returned without turning a
rejected result into an accepted one. Artifact paths refer to the backend host,
not necessarily the machine running DSH.

Analysis can take minutes and calls the configured model API. The DSH bridge
allows up to one hour per tool call. Cancellation closes the HTTP request;
termination of any already-running backend/model work still depends on the
backend. Failed or interrupted analysis is never automatically retried.

The standard stdio entry also works with another MCP host after configuring its
working directory, environment, and timeout:

```sh
node plugins/docmosaic/mcp/server.mjs
```

Stdout is reserved for MCP messages. Run this through an MCP client, not as an
interactive shell. No DSH-specific Python runtime or DSH source checkout is
required.

## Development and validation

```sh
npm --prefix plugins/docmosaic ci
npm --prefix plugins/docmosaic run check
npm --prefix plugins/docmosaic test
npm pack ./plugins/docmosaic --dry-run
```

Tests use an isolated local fake backend and real MCP stdio transport. They do
not call a live model or modify the existing application services. A successful
protocol test does not establish real model quality or a successful MinerU run.
The bundle was also installed into an isolated DSH 0.2.1-rc.2 SDK profile:
all three namespaced tools were registered and the bundled Skill body loaded.

The package is private and unlicensed pending an explicit publication decision;
local installation and `npm pack` work without publishing to npm. DSH's preview
interfaces can change, so compatibility must be checked before changing the pin.

References: [DSH MCP client](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/mcp/mcp-client/README.md),
[DSH Skill provider](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill-filesystem/README.md),
[DSH bundles](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md).
