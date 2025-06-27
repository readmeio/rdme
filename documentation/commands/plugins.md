`rdme plugins`
==============

List installed plugins.

* [`rdme plugins`](#rdme-plugins)
* [`rdme plugins:inspect PLUGIN...`](#rdme-pluginsinspect-plugin)
* [`rdme plugins install PLUGIN`](#rdme-plugins-install-plugin)
* [`rdme plugins link PATH`](#rdme-plugins-link-path)
* [`rdme plugins reset`](#rdme-plugins-reset)
* [`rdme plugins uninstall [PLUGIN]`](#rdme-plugins-uninstall-plugin)
* [`rdme plugins update`](#rdme-plugins-update)

## `rdme plugins`

List installed plugins.

```
USAGE
  $ rdme plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ rdme plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/index.ts)_

## `rdme plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ rdme plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ rdme plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/inspect.ts)_

## `rdme plugins install PLUGIN`

Installs a plugin into rdme.

```
USAGE
  $ rdme plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into rdme.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the RDME_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the RDME_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ rdme plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ rdme plugins install myplugin

  Install a plugin from a github url.

    $ rdme plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ rdme plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/install.ts)_

## `rdme plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ rdme plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
      --[no-]install  Install dependencies after linking the plugin.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ rdme plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/link.ts)_

## `rdme plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ rdme plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/reset.ts)_

## `rdme plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ rdme plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ rdme plugins unlink
  $ rdme plugins remove

EXAMPLES
  $ rdme plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/uninstall.ts)_

## `rdme plugins update`

Update installed plugins.

```
USAGE
  $ rdme plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/update.ts)_
