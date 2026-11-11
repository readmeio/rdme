import { describe, expect, it } from 'vitest';

import { getPublishPlan } from '../../bin/publish.js';

describe('getPublishPlan', () => {
  it('publishes stable 10.x from main on the latest dist-tag', () => {
    expect(getPublishPlan('refs/heads/main', '10.10.2')).toStrictEqual({});
  });

  it('refuses prereleases', () => {
    expect(getPublishPlan('refs/heads/main', '10.10.2-next.1')).toStrictEqual({
      error: 'Refusing to publish prerelease version 10.10.2-next.1.',
    });
  });

  it('refuses 9.x from main', () => {
    expect(getPublishPlan('refs/heads/main', '9.2.4').error).toContain('9.x releases belong on the v9 branch');
  });

  it('publishes 9.x from the v9 branch on the release-v9 dist-tag', () => {
    expect(getPublishPlan('refs/heads/v9', '9.2.4')).toStrictEqual({ tag: 'release-v9' });
    expect(getPublishPlan('refs/heads/v9', '9.10.0')).toStrictEqual({ tag: 'release-v9' });
  });

  it('refuses a major bump on v9', () => {
    expect(getPublishPlan('refs/heads/v9', '10.0.0').error).toContain('stay on 9.x');
  });

  it('refuses any other ref', () => {
    expect(getPublishPlan('refs/heads/next', '10.10.2').error).toContain('refs/heads/next');
    expect(getPublishPlan(undefined, '10.10.2').error).toContain('unknown ref');
  });
});
