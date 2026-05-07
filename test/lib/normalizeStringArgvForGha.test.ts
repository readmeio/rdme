import stringArgv from 'string-argv';
import { describe, expect, it } from 'vitest';

import { normalizeStringArgvForGha } from '../../src/lib/normalizeStringArgvForGha.js';

describe('normalizeStringArgvForGha()', () => {
  it('strips double quotes from `--long=value` tokens', () => {
    const argv = stringArgv('openapi upload --key="secret"');
    expect(normalizeStringArgvForGha(argv)).toStrictEqual(['openapi', 'upload', '--key=secret']);
  });

  it('strips single quotes from `--long=value` tokens', () => {
    const argv = stringArgv("openapi upload --key='secret'");
    expect(normalizeStringArgvForGha(argv)).toStrictEqual(['openapi', 'upload', '--key=secret']);
  });

  it('leaves unquoted equals-form flags unchanged', () => {
    expect(normalizeStringArgvForGha(['openapi', 'upload', '--key=secret'])).toStrictEqual([
      'openapi',
      'upload',
      '--key=secret',
    ]);
  });

  it('strips quotes when value contains spaces (`string-argv` single token)', () => {
    const argv = stringArgv('whoami --branch="name with spaces"');
    expect(normalizeStringArgvForGha(argv)).toStrictEqual(['whoami', '--branch=name with spaces']);
  });

  it('does not change positional args or flags without `=`', () => {
    expect(normalizeStringArgvForGha(['openapi', 'upload', './spec.json', '--dry-run'])).toStrictEqual([
      'openapi',
      'upload',
      './spec.json',
      '--dry-run',
    ]);
  });

  it('normalizes empty quoted value to bare equals suffix', () => {
    const argv = stringArgv('whoami --title=""');
    expect(normalizeStringArgvForGha(argv)).toStrictEqual(['whoami', '--title=']);
  });

  it('does not strip mismatched or partial quotes', () => {
    expect(normalizeStringArgvForGha(['--key="unfinished'])).toStrictEqual(['--key="unfinished']);
    expect(normalizeStringArgvForGha(['--url=https://example.com?q="x"'])).toStrictEqual([
      '--url=https://example.com?q="x"',
    ]);
  });
});
