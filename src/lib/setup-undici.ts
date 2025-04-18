import { fetch as undiciFetch, EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';

export default function setupUndici(opts?: EnvHttpProxyAgent.Options) {
  const envHttpProxyAgent = new EnvHttpProxyAgent(opts);
  setGlobalDispatcher(envHttpProxyAgent);

  Object.defineProperties(globalThis, {
    fetch: { value: undiciFetch },
  });
}
