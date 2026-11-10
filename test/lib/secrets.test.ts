// oxlint-disable import/first -- `vi.mock` is hoisted and has to sit next to the import it replaces.
import debugModule from 'debug';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { setSecret } = vi.hoisted(() => ({
  setSecret: vi.fn(),
}));

vi.mock(import('@actions/core'), async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, setSecret };
});

import { debug } from '../../src/lib/logger.js';
import {
  maskForGitHubActions,
  redactArgv,
  redactProxyFromText,
  redactLoggedValue,
  redactProxyUrl,
  redactResponseBody,
  redactSecretFields,
  redactSensitiveOptions,
} from '../../src/lib/secrets.js';

describe('secret redaction', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setSecret.mockClear();
  });

  describe('#redactResponseBody()', () => {
    it('redacts nested credential fields and leaves the rest of the body', () => {
      const raw = JSON.stringify({
        email: 'a@b.co',
        data: { apiKey: 'rdme_dummy123', token: 'tok_abcdef', nested: { password: 'hunter2hunter2' } },
        items: [{ secret: 'sec_abcdef' }, { name: 'ok' }],
      });

      expect(JSON.parse(redactResponseBody(raw))).toStrictEqual({
        email: 'a@b.co',
        data: { apiKey: '[REDACTED]', token: '[REDACTED]', nested: { password: '[REDACTED]' } },
        items: [{ secret: '[REDACTED]' }, { name: 'ok' }],
      });
      expect(redactResponseBody(raw)).not.toContain('rdme_dummy123');
      expect(redactResponseBody(raw)).not.toContain('tok_abcdef');
      expect(redactResponseBody(raw)).not.toContain('hunter2hunter2');
      expect(redactResponseBody(raw)).not.toContain('sec_abcdef');
    });

    it('redacts credential fields in pretty-printed JSON and is case-insensitive', () => {
      const pretty = `{
        "ApiKey": "rdme_dummy123",
        "api_key": "rdme_other456",
        "email": "a@b.co"
      }`;

      expect(JSON.parse(redactResponseBody(pretty))).toStrictEqual({
        ApiKey: '[REDACTED]',
        api_key: '[REDACTED]',
        email: 'a@b.co',
      });
      expect(redactResponseBody(pretty)).not.toContain('rdme_dummy123');
      expect(redactResponseBody(pretty)).not.toContain('rdme_other456');
    });

    it('does not treat nearby field names as credentials', () => {
      expect(JSON.parse(redactResponseBody('{"token_type":"Bearer","access":"ok"}'))).toStrictEqual({
        token_type: 'Bearer',
        access: 'ok',
      });
    });

    it('redacts JSON-shaped fragments when the body is not valid JSON', () => {
      expect(redactResponseBody('nope {"password":"hunter2hunter2"} trailing')).toBe(
        'nope {"password":"[REDACTED]"} trailing',
      );
    });
  });

  describe('#redactSecretFields()', () => {
    it('redacts escaped credential values without leaving the tail behind', () => {
      expect(redactSecretFields('{"password":"hun\\"ter2xx"}')).toBe('{"password":"[REDACTED]"}');
    });

    it('does not redact field names that only share a prefix', () => {
      expect(redactSecretFields('{"token_type":"Bearer","otpHint":"123"}')).toBe(
        '{"token_type":"Bearer","otpHint":"123"}',
      );
    });
  });

  describe('#redactSensitiveOptions()', () => {
    it('replaces credential flags in a copy and keeps the command input', () => {
      const options = {
        email: 'a@b.co',
        github: true,
        key: 'rdme_dummy123',
        otp: 'otp-998877',
        password: 'hunter2hunter2',
        project: 'owl',
      };

      expect(redactSensitiveOptions(options)).toStrictEqual({
        email: 'a@b.co',
        github: true,
        key: '[REDACTED]',
        otp: '[REDACTED]',
        password: '[REDACTED]',
        project: 'owl',
      });
      expect(options.key).toBe('rdme_dummy123');
      expect(options.password).toBe('hunter2hunter2');
    });

    it('redacts short credential flags that the Actions runner would not mask', () => {
      expect(redactSensitiveOptions({ key: 'short', project: 'owl' })).toStrictEqual({
        key: '[REDACTED]',
        project: 'owl',
      });
    });

    it('leaves an empty credential flag empty', () => {
      expect(redactSensitiveOptions({ key: '' })).toStrictEqual({ key: '' });
    });
  });

  describe('proxy URLs', () => {
    it('leaves a proxy without credentials unchanged', () => {
      expect(redactProxyUrl('http://proxy.example:8080')).toBe('http://proxy.example:8080');
      expect(redactProxyFromText('via http://proxy.example:8080', 'http://proxy.example:8080')).toBe(
        'via http://proxy.example:8080',
      );
      expect(redactProxyFromText('hello')).toBe('hello');
      expect(redactProxyUrl('not a url')).toBe('not a url');
    });

    it('removes userinfo from a proxy URL', () => {
      const once = redactProxyUrl('http://user:supersecret@proxy.example:8080');

      expect(once).toBe('http://redacted:redacted@proxy.example:8080/');
      expect(once).not.toContain('supersecret');
      expect(redactProxyUrl(once)).toBe(once);
    });

    it('removes a username-only proxy credential', () => {
      expect(redactProxyUrl('http://proxyuser@proxy.example:8080')).toBe('http://redacted@proxy.example:8080/');
    });

    it('scrubs the raw proxy URL and an encoded password from an error', () => {
      const proxy = 'https://user:p%40ssword@proxy.example:8080';
      const redacted = redactProxyFromText(`failed ${proxy} because p@ssword was rejected`, proxy);

      expect(redacted).not.toContain('p%40ssword');
      expect(redacted).not.toContain('p@ssword');
      expect(redacted).toContain('redacted:redacted@proxy.example:8080');
    });
  });

  describe('#redactArgv()', () => {
    it('removes credential flag values without changing the original argv', () => {
      const argv = [
        '--email',
        'a@b.co',
        '--password',
        'hunter2hunter2',
        '--otp=otp-998877',
        '--api_key=rdme_other456',
        '--project',
        'owl',
      ];

      expect(redactArgv(argv)).toStrictEqual([
        '--email',
        'a@b.co',
        '--password',
        '[REDACTED]',
        '--otp=[REDACTED]',
        '--api_key=[REDACTED]',
        '--project',
        'owl',
      ]);
      expect(argv).toStrictEqual([
        '--email',
        'a@b.co',
        '--password',
        'hunter2hunter2',
        '--otp=otp-998877',
        '--api_key=rdme_other456',
        '--project',
        'owl',
      ]);
    });

    it('redacts a credential value that starts with a dash and leaves the next flag', () => {
      expect(
        redactArgv(['login', '--password', '-hunter2-unique', '--otp=-also-secret', '--project', 'owl']),
      ).toStrictEqual(['login', '--password', '[REDACTED]', '--otp=[REDACTED]', '--project', 'owl']);
      expect(redactArgv(['--password', '--email', 'a@b.co'])).toStrictEqual(['--password', '--email', 'a@b.co']);
    });
  });

  describe('#maskForGitHubActions()', () => {
    it('does not emit masks from the test runner', () => {
      vi.stubEnv('TEST_RDME_GHA', 'true');

      maskForGitHubActions('rdme_dummy123');
      redactResponseBody('{"apiKey":"rdme_dummy123"}');

      expect(setSecret).not.toHaveBeenCalled();
    });

    it('registers credential values with the Actions runner and ignores short or placeholder values', () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('TEST_RDME_GHA', 'true');

      redactResponseBody('{"apiKey":"rdme_dummy123","email":"a@b.co"}');
      redactResponseBody('{"apiKey":"[REDACTED]"}');
      maskForGitHubActions('short');
      maskForGitHubActions(12);
      redactProxyUrl('http://user:supersecret@proxy.example:8080');

      expect(setSecret).toHaveBeenCalledWith('rdme_dummy123');
      expect(setSecret).toHaveBeenCalledWith('supersecret');
      expect(setSecret).not.toHaveBeenCalledWith('a@b.co');
      expect(setSecret).not.toHaveBeenCalledWith('user');
      expect(setSecret).not.toHaveBeenCalledWith('short');
      expect(setSecret).not.toHaveBeenCalledWith('[REDACTED]');
    });
  });

  describe('#redactLoggedValue()', () => {
    it('redacts credential strings and leaves key and object-valued fields', () => {
      const redacted = redactLoggedValue({
        key: 'rdme_dummy123',
        info: { title: 'Pet' },
        components: {
          schemas: {
            User: { properties: { password: { type: 'string' }, token: 'sekret-value' } },
          },
        },
      });

      expect(JSON.parse(JSON.stringify(redacted))).toStrictEqual({
        key: 'rdme_dummy123',
        info: { title: 'Pet' },
        components: {
          schemas: {
            User: { properties: { password: { type: 'string' }, token: '[REDACTED]' } },
          },
        },
      });
    });

    it('redacts an argv array that contains a credential flag and leaves other string arrays', () => {
      expect(redactLoggedValue(['--email', 'a@b.co', '--key', 'rdme_dummy123'])).toStrictEqual([
        '--email',
        'a@b.co',
        '--key',
        '[REDACTED]',
      ]);
      expect(redactLoggedValue(['docs', '--dry-run', 'page.md'])).toStrictEqual(['docs', '--dry-run', 'page.md']);
    });

    it('redacts credential fields rendered from an Error', () => {
      const redacted = redactLoggedValue(new Error('login failed {"password":"hunter2hunter2"}'));

      expect(redacted).toBeTypeOf('string');
      expect(redacted).not.toContain('hunter2hunter2');
      expect(redacted).toContain('[REDACTED]');
    });

    it('does not treat a JSON key field as a credential', () => {
      const redacted = redactLoggedValue('{"key":"page-id","apiKey":"rdme_dummy123"}');
      if (typeof redacted !== 'string') {
        throw new TypeError('expected a redacted string');
      }

      expect(JSON.parse(redacted)).toStrictEqual({
        key: 'page-id',
        apiKey: '[REDACTED]',
      });
    });
  });

  it('strips credential fields before they reach the debug logger', () => {
    const lines: unknown[][] = [];
    const previousNamespaces = debugModule.disable();
    const previousLog = debugModule.log;
    debugModule.enable('rdme');
    debugModule.log = (...args: unknown[]) => {
      lines.push(args);
    };

    try {
      debug('received JSON response: {"apiKey":"rdme_dummy123","email":"a@b.co"}');
    } finally {
      debugModule.log = previousLog;
      debugModule.enable(previousNamespaces);
    }

    const logged = lines.flat().map(String).join('\n');
    expect(logged).toContain('[REDACTED]');
    expect(logged).toContain('a@b.co');
    expect(logged).not.toContain('rdme_dummy123');
  });

  it('redacts objects before they reach either debug sink', () => {
    const lines: unknown[][] = [];
    const previousNamespaces = debugModule.disable();
    const previousLog = debugModule.log;
    debugModule.enable('rdme');
    debugModule.log = (...args: unknown[]) => {
      lines.push(args);
    };

    try {
      debug({ apiKey: 'rdme_dummy123', email: 'a@b.co', nested: { password: 'hunter2hunter2' } });
    } finally {
      debugModule.log = previousLog;
      debugModule.enable(previousNamespaces);
    }

    const logged = lines.flat().map(String).join('\n');
    expect(logged).toContain('[REDACTED]');
    expect(logged).toContain('a@b.co');
    expect(logged).not.toContain('rdme_dummy123');
    expect(logged).not.toContain('hunter2hunter2');
  });
});
