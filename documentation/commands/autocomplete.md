`rdme autocomplete`
===================

Display autocomplete installation instructions.

* [`rdme autocomplete [SHELL]`](#rdme-autocomplete-shell)

## `rdme autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ rdme autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ rdme autocomplete

  $ rdme autocomplete bash

  $ rdme autocomplete zsh

  $ rdme autocomplete powershell

  $ rdme autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.2.33/src/commands/autocomplete/index.ts)_
