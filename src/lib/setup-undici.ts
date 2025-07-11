/* eslint-disable import/extensions */
// import { fetch as undiciFetch, EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';

import EnvHttpProxyAgent from 'undici/lib/dispatcher/env-http-proxy-agent.js';
import { setGlobalDispatcher } from 'undici/lib/global.js';
import { fetch as undiciFetch } from 'undici/lib/web/fetch/index.js';

export default function setupUndici() {
  const envHttpProxyAgent = new EnvHttpProxyAgent();
  setGlobalDispatcher(envHttpProxyAgent);

  Object.defineProperties(globalThis, {
    fetch: { value: undiciFetch },
  });
}
