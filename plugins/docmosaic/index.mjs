import { fileURLToPath } from 'node:url';
import * as mcpClient from '@deepseek-ai/dsh-mcp-client';
import * as skillFilesystem from '@deepseek-ai/dsh-skill-filesystem';

export const name = 'datamosaic-docmosaic';
export const inject = ['tools', 'skills'];

export function apply(ctx) {
  const workspace = process.env.DOCMOSAIC_WORKSPACE_ROOT || process.cwd();
  const keys = ['DOCMOSAIC_ENV_FILE', 'DOCPILOT_URL', 'DOCPILOT_PROVIDER',
    'DOCPILOT_MODEL', 'DOCPILOT_MODEL_BASE_URL', 'DOCPILOT_API_KEY', 'DOCPILOT_REASONING'];
  const env = Object.fromEntries(keys.filter(key => process.env[key] !== undefined)
    .map(key => [key, process.env[key]]));
  ctx.plugin(mcpClient, {
    serverName: 'docmosaic',
    transport: 'stdio',
    command: process.execPath,
    args: [fileURLToPath(new URL('./mcp/server.mjs', import.meta.url))],
    cwd: workspace,
    env: { ...env, DOCMOSAIC_WORKSPACE_ROOT: workspace },
    toolCallTimeoutMs: 3_600_000,
    failOnStartupError: true,
  });
  ctx.plugin(skillFilesystem, {
    providerName: 'datamosaic-docmosaic',
    includeDefaultRoots: false,
    customSkillDirs: [fileURLToPath(new URL('./skills', import.meta.url))],
  });
}
