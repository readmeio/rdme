import { locate } from 'func-loc';
import { fetch as undiciFetch, EnvHttpProxyAgent, setGlobalDispatcher } from 'undici';

export default async function setupUndici(opts?: EnvHttpProxyAgent.Options) {
  console.log('before', await locate(fetch));

  const envHttpProxyAgent = new EnvHttpProxyAgent(opts);
  setGlobalDispatcher(envHttpProxyAgent);

  Object.defineProperties(globalThis, {
    fetch: { value: undiciFetch },
  });
  console.log('after', await locate(fetch));
}
