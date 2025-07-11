/**
 * The `undici` module has this fun combination of two annoying issues:
 * 1. It's written in JavaScript and its TypeScript definitions are not colocated with the source files.
 * 2. Its root entry file contains an export that uses `node:sqlite` (which is only available in Node.js 24+)
 *
 * So instead of importing from the root, we import from the specific files that we need.
 * This way we can avoid the `node:sqlite` export.
 */
declare module 'undici/lib/dispatcher/env-http-proxy-agent.js';
declare module 'undici/lib/global.js';
declare module 'undici/lib/web/fetch/index.js';
