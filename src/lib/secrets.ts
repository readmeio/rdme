import { inspect } from 'node:util';

import * as core from '@actions/core';

import { isGHA, isTest } from './isCI.js';

/**
 * Placeholder written in place of a credential.
 *
 * Kept stable so log redaction can run more than once without eating the placeholder.
 */
const REDACTED = '[REDACTED]';

/**
 * Stand-in for proxy userinfo. Distinct from {@link REDACTED} so a redacted proxy URL still shows
 * that a proxy was configured.
 */
const PROXY_PLACEHOLDER = 'redacted';

/**
 * The Actions runner ignores very short masks, and a short value would hide unrelated log text.
 * Flag and JSON redaction still removes shorter secrets.
 */
const MIN_MASK_LENGTH = 6;

/**
 * Credential fields in API JSON and in objects written to the debug log.
 *
 * `key` is intentionally absent: response bodies and specs use it for non-secret identifiers.
 * The CLI `--key` flag is removed by {@link redactSensitiveOptions} at the two places a flag bag
 * is logged.
 */
const SECRET_JSON_KEYS = ['apikey', 'api_key', 'token', 'password', 'otp', 'secret'] as const;

const SECRET_JSON_KEY_SET = new Set<string>(SECRET_JSON_KEYS);

/**
 * CLI credential names. `key` is the one name that is a flag and not a JSON field.
 * Argv flags are `--` plus these names. Oclif logs `this.argv` through `this.debug` in
 * `Command#init`, so the debug sink redacts an array only when it contains one of these flags.
 */
const SENSITIVE_OPTION_NAMES = new Set<string>(['key', ...SECRET_JSON_KEYS]);

const SENSITIVE_ARGV_FLAGS = new Set([...SENSITIVE_OPTION_NAMES].map(name => `--${name}`));

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches `"secretName": "value"` for every {@link SECRET_JSON_KEYS} entry.
 * The value group allows escaped quotes so a secret containing `\"` is consumed whole.
 */
const SECRET_JSON_FIELD = new RegExp(
  `("(?:${SECRET_JSON_KEYS.map(escapeRegExp).join('|')})"\\s*:\\s*)"((?:\\\\.|[^"\\\\])*)"`,
  'gi',
);

function isSecretJsonKey(key: string) {
  return SECRET_JSON_KEY_SET.has(key.toLowerCase());
}

function isPlaceholder(value: string) {
  return value === REDACTED || value === PROXY_PLACEHOLDER;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function uniqueSecrets(values: string[]) {
  const seen = new Set<string>();
  const secrets: string[] = [];
  for (const value of values) {
    if (value.length >= MIN_MASK_LENGTH && !isPlaceholder(value) && !seen.has(value)) {
      seen.add(value);
      secrets.push(value);
    }
  }
  return secrets;
}

/**
 * Registers a secret with the GitHub Actions log masker.
 *
 * Later log lines that contain the value are printed as `***`. Masking is not retroactive, so the
 * line that first contains the secret still has to be redacted before it is written.
 */
export function maskForGitHubActions(value: unknown) {
  if (typeof value !== 'string') return;
  const secret = value.trim();
  if (secret.length < MIN_MASK_LENGTH || isPlaceholder(secret)) return;

  // Tests run with `NODE_ENV=rdme-test` inside the Actions runner. Skip masking there so workflow
  // commands are not written into Vitest's stdout.
  if (!isGHA() || isTest()) return;
  core.setSecret(secret);
}

function maskAll(values: string[]) {
  for (const value of uniqueSecrets(values)) maskForGitHubActions(value);
}

function decodeJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value;
  }
}

/**
 * Replaces JSON-shaped `"secret": "value"` pairs in a string.
 *
 * Used for log lines that embed a body, and for response text that is not valid JSON.
 */
export function redactSecretFields(text: string) {
  SECRET_JSON_FIELD.lastIndex = 0;
  return text.replace(SECRET_JSON_FIELD, (_match, prefix: string, value: string) => {
    maskForGitHubActions(decodeJsonString(value));
    return `${prefix}"${REDACTED}"`;
  });
}

function redactSecretTree(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(item => redactSecretTree(item));
  if (!value || typeof value !== 'object') return value;

  const output: Record<string, unknown> = Object.create(null);
  for (const [key, nested] of Object.entries(value)) {
    if (isSecretJsonKey(key)) {
      if (typeof nested === 'string') maskForGitHubActions(nested);
      output[key] = REDACTED;
    } else {
      output[key] = redactSecretTree(nested);
    }
  }
  return output;
}

/**
 * Redacts credential fields in a response body before it is written to a log.
 *
 * Valid JSON is walked so nested and escaped values are covered. Other text is scanned for
 * JSON-shaped pairs.
 */
export function redactResponseBody(text: string) {
  try {
    return JSON.stringify(redactSecretTree(JSON.parse(text)));
  } catch {
    return redactSecretFields(text);
  }
}

/**
 * Returns a copy of an argv list with values for credential flags removed.
 *
 * Accepts `--password value`, `--password=value`, and a value that itself starts with a dash
 * (`--password -hunter2`). Oclif logs `this.argv` before parsing, so that value has to be removed
 * here. A following `--flag` is left for its own pass.
 */
export function redactArgv(argv: readonly string[]) {
  const redacted: string[] = [];
  let index = 0;

  while (index < argv.length) {
    const token = argv[index];
    const equals = token.startsWith('--') ? token.indexOf('=') : -1;
    const flag = (equals === -1 ? token : token.slice(0, equals)).toLowerCase();
    const next = argv[index + 1];
    // `-hunter2` is a value. `--email` is another flag and must not be swallowed.
    const takesNext = equals === -1 && next !== undefined && !next.startsWith('--');

    if (!SENSITIVE_ARGV_FLAGS.has(flag)) {
      redacted.push(token);
      index += 1;
    } else if (equals !== -1) {
      maskForGitHubActions(token.slice(equals + 1));
      redacted.push(`${token.slice(0, equals)}=${REDACTED}`);
      index += 1;
    } else if (takesNext) {
      maskForGitHubActions(next);
      redacted.push(token, REDACTED);
      index += 2;
    } else {
      redacted.push(token);
      index += 1;
    }
  }

  return redacted;
}

function isCredentialArgv(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === 'string') &&
    value.some(item => {
      const equals = item.startsWith('--') ? item.indexOf('=') : -1;
      const flag = equals === -1 ? item : item.slice(0, equals);
      return SENSITIVE_ARGV_FLAGS.has(flag.toLowerCase());
    })
  );
}

/**
 * Returns a copy of a flat flag bag with credential flags removed.
 *
 * The input is left unchanged so the command still receives the real values. Only top-level string
 * values are replaced. This is the only redaction path that treats `key` as a secret. Response
 * JSON and other logged objects use {@link redactResponseBody}, which leaves `key` alone.
 */
export function redactSensitiveOptions<T extends object>(options: T): T {
  const redacted: T = { ...options };
  const record = redacted as Record<string, unknown>;
  for (const name of Object.keys(record)) {
    const value = record[name];
    if (SENSITIVE_OPTION_NAMES.has(name.toLowerCase()) && typeof value === 'string' && value.length > 0) {
      maskForGitHubActions(value);
      record[name] = REDACTED;
    }
  }
  return redacted;
}

function redactLoggedValueWithSeen(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') return redactResponseBody(value);
  if (value instanceof Error) return redactResponseBody(inspect(value));
  if (isCredentialArgv(value)) return redactArgv(value);
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';

  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map(item => redactLoggedValueWithSeen(item, seen));

    const output: Record<string, unknown> = Object.create(null);
    for (const [key, nested] of Object.entries(value)) {
      if (typeof nested === 'string' && nested.length > 0 && isSecretJsonKey(key)) {
        maskForGitHubActions(nested);
        output[key] = REDACTED;
      } else {
        output[key] = redactLoggedValueWithSeen(nested, seen);
      }
    }
    return output;
  } finally {
    seen.delete(value);
  }
}

/**
 * Redacts one value before it is written to either debug sink.
 *
 * Strings are scanned as response text. Errors are rendered first, then scanned the same way.
 * Objects are walked for credential field names. Object-valued fields keep their shape, so a
 * schema named `password` is not wiped, and `key` is left alone. Flat flag bags go through
 * {@link redactSensitiveOptions}. An argv array is redacted only when it contains a credential flag,
 * which is how oclif logs `this.argv` from `Command#init`.
 */
export function redactLoggedValue(value: unknown): unknown {
  return redactLoggedValueWithSeen(value, new WeakSet());
}

interface ProxyCredentials {
  redacted: string;
  secrets: string[];
}

function readProxyCredentials(proxy: string): ProxyCredentials | undefined {
  const addedScheme = !/^[a-z][a-z0-9+.-]*:\/\//i.test(proxy);
  let url: URL;
  try {
    url = new URL(addedScheme ? `http://${proxy}` : proxy);
  } catch {
    return undefined;
  }

  const encodedUsername = url.username;
  const encodedPassword = url.password;
  const username = safeDecode(encodedUsername);
  const password = safeDecode(encodedPassword);
  if (!username && !password) return undefined;
  if (isPlaceholder(username) && (password === '' || isPlaceholder(password))) return undefined;

  url.username = username ? PROXY_PLACEHOLDER : '';
  url.password = password ? PROXY_PLACEHOLDER : '';
  let redacted = url.toString();
  if (addedScheme) redacted = redacted.replace(/^http:\/\//, '');

  return {
    redacted,
    secrets: uniqueSecrets([username, password, encodedUsername, encodedPassword]),
  };
}

/**
 * Returns a proxy URL with `user:password` removed, and registers those credentials so a later log
 * line is masked.
 */
export function redactProxyUrl(proxy: string) {
  const credentials = readProxyCredentials(proxy);
  if (!credentials) return proxy;
  maskAll(credentials.secrets);
  return credentials.redacted;
}

/**
 * Rewrites a log line so a proxy URL and its credentials cannot appear in it.
 */
export function redactProxyFromText(text: string, proxy?: string) {
  if (!proxy) return text;
  const credentials = readProxyCredentials(proxy);
  if (!credentials) return text;

  maskAll(credentials.secrets);
  let output = text.split(proxy).join(credentials.redacted);
  for (const secret of credentials.secrets) {
    output = output.split(secret).join(REDACTED);
  }
  return output;
}
