import type { OclifOutput } from '../../helpers/oclif.js';

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import Command from '../../../src/commands/openapi/inspect.js';
import * as analyzeOas from '../../../src/lib/analyzeOas.js';
import { runCommand } from '../../helpers/oclif.js';

describe('rdme openapi inspect', () => {
  let run: (args?: string[]) => OclifOutput;

  beforeAll(() => {
    run = runCommand(Command);
  });

  describe('full reports', () => {
    it.each([
      '@readme/oas-examples/3.0/json/petstore.json',
      '@readme/oas-examples/3.0/json/readme-legacy.json',
      '@readme/oas-examples/3.0/json/readme-extensions.json',
      '@readme/oas-examples/3.1/json/train-travel.json',
    ])('should generate a report for %s', async spec => {
      const { result } = await run([require.resolve(spec)]);
      expect(result).toMatchSnapshot();
    });
  });

  describe('feature reports', () => {
    it('should throw an error if an invalid feature is supplied', () => {
      const spec = require.resolve('@readme/oas-examples/3.0/json/readme-extensions.json');
      return expect(run([spec, '--feature', 'style', '--feature', 'reamde'])).resolves.toMatchSnapshot();
    });

    const cases: { feature: string[]; shouldSoftError?: true; spec: string }[] = [
      {
        spec: '@readme/oas-examples/3.0/json/readme-legacy.json',
        feature: ['polymorphism'],
      },
      {
        spec: '@readme/oas-examples/3.0/json/schema-circular.json',
        feature: ['additionalProperties', 'circularRefs'],
      },
      {
        spec: '@readme/oas-examples/3.1/json/train-travel.json',
        feature: ['commonParameters'],
      },

      // Soft error cases where we may or may not contain the features we're querying for.
      {
        spec: '@readme/oas-examples/3.0/json/readme-extensions.json',
        feature: ['circularRefs'],
        shouldSoftError: true,
      },
      {
        spec: '@readme/oas-examples/3.0/json/readme-extensions.json',
        feature: ['circularRefs', 'webhooks'],
        shouldSoftError: true,
      },
    ];

    // oxlint-disable vitest/no-conditional-expect
    it.each(cases)('should generate a report for $spec (w/ $feature)', async ({ spec, feature, shouldSoftError }) => {
      const args = [require.resolve(spec)].concat(...feature.map(f => ['--feature', f]));
      const { result, error } = await run(args);
      if (!shouldSoftError) {
        expect(result).toBeDefined();
        expect(result).toMatchSnapshot();
      } else {
        expect(error).toBeDefined();
        expect(error).toMatchSnapshot();
      }
    });
    // oxlint-enable vitest/no-conditional-expect
  });

  describe('analyzer failures', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fail the spinner when analysis throws', async () => {
      vi.spyOn(analyzeOas, 'default').mockRejectedValue(new Error('analyzer down'));
      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const output = await run([spec]);

      expect(output.error).toBeInstanceOf(Error);
      expect(output.error?.message).toBe('analyzer down');
    });
  });

  describe('report edge cases', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate a report for a Swagger 2.0 definition', async () => {
      const spec = require.resolve('@readme/oas-examples/2.0/json/petstore.json');
      const { result, error } = await run([spec]);

      expect(error).toBeUndefined();
      expect(result).toContain('OpenAPI Features');
    });

    it('should highlight unusually large APIs and omit empty or hidden stats', async () => {
      const original = analyzeOas.default;
      vi.spyOn(analyzeOas, 'default').mockImplementation(async spec => {
        const analysis = await original(spec);
        analysis.general.operationTotal = { name: 'Operation', found: 201 };
        analysis.general.mediaTypes = { name: 'Media Type', found: [] };
        analysis.general.securityTypes = { name: 'Security Scheme', found: 0 };
        analysis.openapi.style.hidden = true;
        analysis.openapi.links.url = 'https://example.com/links';
        return analysis;
      });

      const spec = require.resolve('@readme/oas-examples/3.0/json/petstore.json');
      const { result, error } = await run([spec]);

      expect(error).toBeUndefined();
      expect(result).toContain('Wow!');
      expect(result).toContain('https://example.com/links');
      expect(result).not.toContain('style');
    });

    it('should fall back when a 3.1 feature has no 3.1 docs URL', async () => {
      const original = analyzeOas.default;
      vi.spyOn(analyzeOas, 'default').mockImplementation(async spec => {
        const analysis = await original(spec);
        analysis.openapi.webhooks.url = { '3.0': 'https://example.com/webhooks-3.0' };
        return analysis;
      });

      const spec = require.resolve('@readme/oas-examples/3.1/json/train-travel.json');
      const { result, error } = await run([spec]);

      expect(error).toBeUndefined();
      expect(result).toContain('This feature is not available on OpenAPI v3.1.');
    });
  });
});
