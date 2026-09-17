`rdme glossary`
===============

Upload or export glossary terms in your ReadMe project.

* [`rdme glossary export FILE`](#rdme-glossary-export-file)
* [`rdme glossary upload FILE`](#rdme-glossary-upload-file)

## `rdme glossary export FILE`

Export glossary terms from your ReadMe project to a JSON file.

```
USAGE
  $ rdme glossary export FILE --key <value> [--include-group]

ARGUMENTS
  FILE  JSON file to write the exported glossary to.

FLAGS
  --key=<value>    (required) ReadMe project API key
  --include-group  Include terms inherited from the project’s Enterprise group in a separate `group_terms` list. Only
                   applicable to projects within an Enterprise group.

DESCRIPTION
  Export glossary terms from your ReadMe project to a JSON file.

  Exports project terms by default and writes them to a `terms` list, ready for `rdme glossary upload`. The destination
  file is overwritten if it already exists.

  Use `--include-group` to also export terms inherited from an Enterprise group in a separate `group_terms` list. Only
  applicable to projects within an Enterprise group.

  `group_terms` is omitted when group terms are not requested or the project has no Enterprise group.

  Within each list, the first occurrence of a name is retained, ignoring case and surrounding whitespace. Matching names
  in the two lists are preserved.

EXAMPLES
  Export project terms to a JSON file:

    $ rdme glossary export glossary.json

  Also export terms inherited from your Enterprise group:

    $ rdme glossary export glossary.json --include-group

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication
```

## `rdme glossary upload FILE`

Upload glossary terms to your ReadMe project from a JSON file.

```
USAGE
  $ rdme glossary upload FILE --key <value> [--dry-run] [--replace]

ARGUMENTS
  FILE  JSON file containing glossary terms to upload.

FLAGS
  --key=<value>  (required) ReadMe project API key
  --dry-run      Preview the resulting project terms without saving changes.
  --replace      Replace all project terms instead of merging.

DESCRIPTION
  Upload glossary terms to your ReadMe project from a JSON file.

  The JSON file must contain a `terms` array of objects with non-empty `term` and `definition` strings. For example: `{
  "terms": [{ "term": "API", "definition": "Application programming interface" }] }`.

  By default, matching project terms are updated in place, omitted terms are retained, and new terms are added at the
  top in file order. Names are matched ignoring case and surrounding whitespace; the first occurrence in the file wins.

  Use `--replace` to replace all project terms, or `{ "terms": [] }` with `--replace` to clear them. Use `--dry-run` to
  preview the resulting project terms without saving changes.

  `group_terms` from an export is ignored; only project terms are uploaded.

EXAMPLES
  Merge terms from a JSON file into your project glossary:

    $ rdme glossary upload glossary.json

  Preview the resulting project terms without saving changes:

    $ rdme glossary upload glossary.json --dry-run

  Replace all project terms with the terms in the file:

    $ rdme glossary upload glossary.json --replace

FLAG DESCRIPTIONS
  --key=<value>  ReadMe project API key

    An API key for your ReadMe project. Note that API authentication is required despite being omitted from the example
    usage. See our docs for more information: https://github.com/readmeio/rdme/tree/v10#authentication
```
