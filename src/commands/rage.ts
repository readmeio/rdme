import { supportsColor } from 'chalk';
import { getBorderCharacters, table } from 'table';

import BaseCommand from '../lib/baseCommand.js';
import configstore from '../lib/configstore.js';
import getCurrentConfig from '../lib/getCurrentConfig.js';
import isCI, { ciName, isGHA } from '../lib/isCI.js';

export default class RageCommand extends BaseCommand<typeof RageCommand> {
  static description = 'Prints information for debugging.';

  static hidden = true;

  async run() {
    const { apiKey, email, project } = getCurrentConfig.call(this);

    const plugins = Object.entries(this.config.versionDetails?.pluginVersions || {})
      .map(([name, details]) => ({ [name]: details.version }))
      .reduce(
        (acc, plugin) => {
          const [name, version] = Object.entries(plugin)[0];

          // Neither the main bin or any Oclif plugin that we load for normal rdme usage should be
          // included in this list as they ship with rdme.
          if (name === this.config.bin || name.startsWith('@oclif')) {
            return acc;
          }

          acc[name] = version;
          return acc;
        },
        {} as Record<string, string>,
      );

    const rage = {
      CLI: {
        Version: this.config.version,
        'Color support': Boolean(supportsColor),
      },
      Platform: {
        'CPU Architecture': this.config.arch,
        OS: this.config.platform,
        'OS Version': this.config.versionDetails.osVersion,
      },
      Environment: {
        CI: isCI() ? ciName() : false,
        'GitHub Actions': isGHA(),
        'Node Version': this.config.versionDetails.nodeVersion,
      },
      Configuration: {
        // If we didn't find any data in their config file then it's either empty or doens't exist
        // so it seems reasonable to ascertain if we were able to successfully load it or not by
        // that.
        'Loaded successfully': Boolean(apiKey || email || project),
        Path: configstore.path,
      },
      Plugins: {
        'Loaded plugins': Object.keys(plugins).length,
        ...plugins,
      },
    };

    const data = Object.entries(rage)
      .flatMap(([section, values], idx) => {
        const sectionData = Object.entries(values).map(([key, value]) => [`  ${key}:`, value]);
        return [
          [`${section}:`, ''],
          ...sectionData,

          // Only add a group separator if this isn't the last section.
          idx !== Object.keys(rage).length - 1 ? ['', ''] : false,
        ];
      })
      .filter(Boolean) as [string, string][];

    const output = table(data, {
      border: getBorderCharacters('void'),
      drawHorizontalLine: () => false,
      columnDefault: {
        paddingLeft: 0,
        paddingRight: 1,
      },
    });

    return Promise.resolve(output);
  }
}
