## 7.2.0 (2022-04-20)

* feat: adding support for node 18 (#495) ([774407d](https://github.com/readmeio/rdme/commit/774407d)), closes [#495](https://github.com/readmeio/rdme/issues/495)
* feat(help): typos, add `rdme` version (#493) ([fddb614](https://github.com/readmeio/rdme/commit/fddb614)), closes [#493](https://github.com/readmeio/rdme/issues/493)
* chore: add clarifying comment ([d331343](https://github.com/readmeio/rdme/commit/d331343))
* docs: embed loom video (#494) ([b799547](https://github.com/readmeio/rdme/commit/b799547)), closes [#494](https://github.com/readmeio/rdme/issues/494)



## <small>7.1.1 (2022-04-13)</small>

* fix: unsupported version error message having double "v"s (#492) ([c422efb](https://github.com/readmeio/rdme/commit/c422efb)), closes [#492](https://github.com/readmeio/rdme/issues/492)
* docs: minor typo and formatting fix ([6ea59ea](https://github.com/readmeio/rdme/commit/6ea59ea))
* docs(`docs`): clarify slug handling (#491) ([715140c](https://github.com/readmeio/rdme/commit/715140c)), closes [#491](https://github.com/readmeio/rdme/issues/491)



## 7.1.0 (2022-04-12)

* feat: extending support to node 17 (#490) ([3d3985d](https://github.com/readmeio/rdme/commit/3d3985d)), closes [#490](https://github.com/readmeio/rdme/issues/490)
* fix: messy issues with nodeVersionUtils helper needing semver installed (#489) ([bccff2c](https://github.com/readmeio/rdme/commit/bccff2c)), closes [#489](https://github.com/readmeio/rdme/issues/489)



## <small>7.0.3 (2022-04-01)</small>

* fix: our broken set-version-output script (#488) ([832768c](https://github.com/readmeio/rdme/commit/832768c)), closes [#488](https://github.com/readmeio/rdme/issues/488)
* feat: throwing error messaging on node 12 being unsupported (#486) ([e991ef6](https://github.com/readmeio/rdme/commit/e991ef6)), closes [#486](https://github.com/readmeio/rdme/issues/486)
* chore(deps): bump debug from 4.3.3 to 4.3.4 (#487) ([d848ff4](https://github.com/readmeio/rdme/commit/d848ff4)), closes [#487](https://github.com/readmeio/rdme/issues/487)



## <small>7.0.2 (2022-03-31)</small>

* chore: update step name to reflect actual behavior ([393ddb1](https://github.com/readmeio/rdme/commit/393ddb1))
* chore(deps-dev): bumping out of date dev deps (#485) ([d361a0b](https://github.com/readmeio/rdme/commit/d361a0b)), closes [#485](https://github.com/readmeio/rdme/issues/485)
* chore(deps): bump minimist from 1.2.5 to 1.2.6 (#481) ([e23bfd0](https://github.com/readmeio/rdme/commit/e23bfd0)), closes [#481](https://github.com/readmeio/rdme/issues/481)
* feat(openapi): specify spec path and type in success response (#480) ([3a32cc2](https://github.com/readmeio/rdme/commit/3a32cc2)), closes [#480](https://github.com/readmeio/rdme/issues/480)
* fix: upgrading oas-normalize to support openapi 3.1 $ref + description (#484) ([7ffc1f5](https://github.com/readmeio/rdme/commit/7ffc1f5)), closes [#484](https://github.com/readmeio/rdme/issues/484)
* docs: small language tweak to use an additional variable ([b92a55c](https://github.com/readmeio/rdme/commit/b92a55c))
* docs: update GHA description ([bb69d37](https://github.com/readmeio/rdme/commit/bb69d37))
* docs: use variables ([c84550f](https://github.com/readmeio/rdme/commit/c84550f))



## <small>7.0.1 (2022-03-18)</small>

* fix: upgrading oas-normalize to fix a bug with a nested babel dep ([ec6f35a](https://github.com/readmeio/rdme/commit/ec6f35a))
* docs(GHA): checkout guidance, workflow triggers (#479) ([67d7640](https://github.com/readmeio/rdme/commit/67d7640)), closes [#479](https://github.com/readmeio/rdme/issues/479)
* chore: rename file and docs ([ace94f7](https://github.com/readmeio/rdme/commit/ace94f7))



## 7.0.0 (2022-03-10)

> v7 of `rdme` is a massive release that includes first-class GitHub Actions support, a new dry run flag for the `docs` command, and lots of improvements to our documentation. This release includes several breaking changes:
>
> - Removed the `oas` command
> - Dropped support for Node 12
> - Dropped support for the `--token` option in the `openapi` command

* chore: drop support for `oas` command (#448) ([4d42700](https://github.com/readmeio/rdme/commit/4d42700)), closes [#448](https://github.com/readmeio/rdme/issues/448)
* chore: remove deprecated `token` parameter (#451) ([3e595d4](https://github.com/readmeio/rdme/commit/3e595d4)), closes [#451](https://github.com/readmeio/rdme/issues/451)
* chore(deps-dev): bump @readme/eslint-config from 8.2.0 to 8.4.2 (#458) ([934e96e](https://github.com/readmeio/rdme/commit/934e96e)), closes [#458](https://github.com/readmeio/rdme/issues/458)
* chore(deps-dev): bump eslint from 8.8.0 to 8.10.0 (#461) ([e4e9ac1](https://github.com/readmeio/rdme/commit/e4e9ac1)), closes [#461](https://github.com/readmeio/rdme/issues/461)
* chore(deps-dev): bump jest from 27.4.7 to 27.5.1 (#462) ([46793d3](https://github.com/readmeio/rdme/commit/46793d3)), closes [#462](https://github.com/readmeio/rdme/issues/462)
* chore(deps-dev): bump nock from 13.2.2 to 13.2.4 (#457) ([ce0a7b5](https://github.com/readmeio/rdme/commit/ce0a7b5)), closes [#457](https://github.com/readmeio/rdme/issues/457)
* chore(deps): bump actions/checkout from 2.4.0 to 3 (#478) ([f055125](https://github.com/readmeio/rdme/commit/f055125)), closes [#478](https://github.com/readmeio/rdme/issues/478)
* chore(deps): bump actions/setup-node from 2.5.1 to 3 (#459) ([e6644eb](https://github.com/readmeio/rdme/commit/e6644eb)), closes [#459](https://github.com/readmeio/rdme/issues/459)
* chore(deps): bump to setup-node v3 in action (#465) ([cb6b2b3](https://github.com/readmeio/rdme/commit/cb6b2b3)), closes [#465](https://github.com/readmeio/rdme/issues/465)
* chore(deps): bumping out of date deps (#477) ([440c2d0](https://github.com/readmeio/rdme/commit/440c2d0)), closes [#477](https://github.com/readmeio/rdme/issues/477)
* ci(GHA): drop `actions/setup-node` (#476) ([14895a1](https://github.com/readmeio/rdme/commit/14895a1)), closes [#476](https://github.com/readmeio/rdme/issues/476)
* docs: bring alex into build process (#469) ([2995f49](https://github.com/readmeio/rdme/commit/2995f49)), closes [#469](https://github.com/readmeio/rdme/issues/469)
* docs: link touch-ups + fixes ([154aa0f](https://github.com/readmeio/rdme/commit/154aa0f))
* docs: remove duplicated community files (#472) ([7b75047](https://github.com/readmeio/rdme/commit/7b75047)), closes [#472](https://github.com/readmeio/rdme/issues/472)
* docs(docs): guidance on `--dryRun` flag and debugging ([e6b946a](https://github.com/readmeio/rdme/commit/e6b946a))
* docs(GHA): small updates (#468) ([f05d8f1](https://github.com/readmeio/rdme/commit/f05d8f1)), closes [#468](https://github.com/readmeio/rdme/issues/468)
* docs(legacy): add clarity around `readme-oas-key` (#464) ([41d7597](https://github.com/readmeio/rdme/commit/41d7597)), closes [#464](https://github.com/readmeio/rdme/issues/464)
* docs(legacy): adjust emoji in callout ([53c554a](https://github.com/readmeio/rdme/commit/53c554a))
* fix: a weirdly written promise (#463) ([6827352](https://github.com/readmeio/rdme/commit/6827352)), closes [#463](https://github.com/readmeio/rdme/issues/463)
* fix(docs): github secrets usage (#471) ([5ca626f](https://github.com/readmeio/rdme/commit/5ca626f)), closes [#471](https://github.com/readmeio/rdme/issues/471)
* fix(GHA): remove `chalk` overrides from error annotations (#466) ([0c7e364](https://github.com/readmeio/rdme/commit/0c7e364)), closes [#466](https://github.com/readmeio/rdme/issues/466)
* feat: dropping support for node 12 (#440) ([e1552db](https://github.com/readmeio/rdme/commit/e1552db)), closes [#440](https://github.com/readmeio/rdme/issues/440)
* feat(docs): add `--dryRun` option (#454) ([f86b5c6](https://github.com/readmeio/rdme/commit/f86b5c6)), closes [#454](https://github.com/readmeio/rdme/issues/454) [/github.com/readmeio/rdme/pull/454#discussion_r815541984](https://github.com//github.com/readmeio/rdme/pull/454/issues/discussion_r815541984)



## 6.5.0 (2022-03-01)

With this release, we are officially shipping first-class support for GitHub Actions within `rdme` 🚀 this means you can use the power of `rdme` to sync your OpenAPI definitions and Markdown files to ReadMe any time you make changes on GitHub.

Alongside this change, this release includes major documentation updates and support for relative external references when syncing OpenAPI definitions (thanks [@jdecool](https://github.com/jdecool))!

* docs: add contributing guidelines (#442) ([9f86fa0](https://github.com/readmeio/rdme/commit/9f86fa0)), closes [#442](https://github.com/readmeio/rdme/issues/442)
* docs: add GitHub Actions guidance (#439) ([3803172](https://github.com/readmeio/rdme/commit/3803172)), closes [#439](https://github.com/readmeio/rdme/issues/439) [/github.com/readmeio/rdme/pull/439#discussion_r814304680](https://github.com//github.com/readmeio/rdme/pull/439/issues/discussion_r814304680)
* docs: legacy GitHub Action docs (#452) ([518cfd5](https://github.com/readmeio/rdme/commit/518cfd5)), closes [#452](https://github.com/readmeio/rdme/issues/452) [/github.com/readmeio/rdme/pull/439#discussion_r814304680](https://github.com//github.com/readmeio/rdme/pull/439/issues/discussion_r814304680)
* docs: run VSCode formatter, fix TOC (#438) ([d45d9df](https://github.com/readmeio/rdme/commit/d45d9df)), closes [#438](https://github.com/readmeio/rdme/issues/438)
* docs: update Action metadata (#441) ([1341917](https://github.com/readmeio/rdme/commit/1341917)), closes [#441](https://github.com/readmeio/rdme/issues/441)
* docs(openapi): update working directory usage (#453) ([e1745bc](https://github.com/readmeio/rdme/commit/e1745bc)), closes [#453](https://github.com/readmeio/rdme/issues/453)
* feat: add GitHub-specific request headers (#443) ([bf20f2d](https://github.com/readmeio/rdme/commit/bf20f2d)), closes [#443](https://github.com/readmeio/rdme/issues/443)
* feat: add workdir arg to openapi command (#450) ([20c1659](https://github.com/readmeio/rdme/commit/20c1659)), closes [#450](https://github.com/readmeio/rdme/issues/450)
* feat: add wrapper for GitHub Actions (#437) ([f0b9d11](https://github.com/readmeio/rdme/commit/f0b9d11)), closes [#437](https://github.com/readmeio/rdme/issues/437)
* feat: debugging support (#446) ([bdb3c6c](https://github.com/readmeio/rdme/commit/bdb3c6c)), closes [#446](https://github.com/readmeio/rdme/issues/446) [/github.com/readmeio/rdme/pull/446#discussion_r813558777](https://github.com//github.com/readmeio/rdme/pull/446/issues/discussion_r813558777)
* fix: properly call `isGHA()` check ([f563fb6](https://github.com/readmeio/rdme/commit/f563fb6))
* chore: bumping the license year ([9cbcaef](https://github.com/readmeio/rdme/commit/9cbcaef))



## 6.4.0 (2022-02-02)

* feat: add update-notifier to warn when using an old version of rdme (#435) ([8daf569](https://github.com/readmeio/rdme/commit/8daf569)), closes [#435](https://github.com/readmeio/rdme/issues/435)
* feat: sending a custom rdme user agent with all requests (#436) ([bec8c36](https://github.com/readmeio/rdme/commit/bec8c36)), closes [#436](https://github.com/readmeio/rdme/issues/436)



## <small>6.3.2 (2022-02-01)</small>

* chore(deps-dev): bump @readme/eslint-config from 8.1.1 to 8.2.0 (#434) ([f427f97](https://github.com/readmeio/rdme/commit/f427f97)), closes [#434](https://github.com/readmeio/rdme/issues/434)
* chore(deps-dev): bump @readme/oas-examples from 4.3.3 to 4.4.0 (#432) ([bd57fc4](https://github.com/readmeio/rdme/commit/bd57fc4)), closes [#432](https://github.com/readmeio/rdme/issues/432)
* chore(deps-dev): bump eslint from 8.6.0 to 8.8.0 (#431) ([4bfa6c7](https://github.com/readmeio/rdme/commit/4bfa6c7)), closes [#431](https://github.com/readmeio/rdme/issues/431)
* chore(deps-dev): bump jest from 27.4.5 to 27.4.7 (#430) ([c34cf5d](https://github.com/readmeio/rdme/commit/c34cf5d)), closes [#430](https://github.com/readmeio/rdme/issues/430)
* chore(deps-dev): bump nock from 13.2.1 to 13.2.2 (#429) ([4896c7b](https://github.com/readmeio/rdme/commit/4896c7b)), closes [#429](https://github.com/readmeio/rdme/issues/429)
* chore(deps): bump command-line-args from 5.2.0 to 5.2.1 (#428) ([ef17420](https://github.com/readmeio/rdme/commit/ef17420)), closes [#428](https://github.com/readmeio/rdme/issues/428)
* chore(deps): bump config from 3.3.3 to 3.3.7 (#433) ([60a765c](https://github.com/readmeio/rdme/commit/60a765c)), closes [#433](https://github.com/readmeio/rdme/issues/433)



## 6.3.0 (2022-01-12)

* refactor: commands into command classes (#424) ([7b8b378](https://github.com/readmeio/rdme/commit/7b8b378)), closes [#424](https://github.com/readmeio/rdme/issues/424)
* fix: quirks with version commands and config retrieval (#423) ([026c633](https://github.com/readmeio/rdme/commit/026c633)), closes [#423](https://github.com/readmeio/rdme/issues/423)
* ci: tweak ESLint config, small refactors (#422) ([f842480](https://github.com/readmeio/rdme/commit/f842480)), closes [#422](https://github.com/readmeio/rdme/issues/422)



## <small>6.2.1 (2022-01-04)</small>

* fix(docs): directory sync fix + test bed rewrites (#421) ([b793afc](https://github.com/readmeio/rdme/commit/b793afc)), closes [#421](https://github.com/readmeio/rdme/issues/421)



## 6.2.0 (2022-01-03)

> 🚦 This includes some upgrades to our internal OpenAPI/Swagger definition parsing engine, [@readme/openapi-parser](https://npm.im/@readme/openapi-parser), to expand validation to a number of new aspects of the specifications:
>
> * Duplicate parameters
> * Paths with parameters with no parameter schemas
> * Duplicate operation IDs
> * Invalid discriminators
> * `type: array` with no `items`
> * And more...
>
> If you have issues with any of these new validations please reach out to us either through an rdme GitHub ticket or our support team at support@readme.io

* chore(deps-dev): bump @readme/eslint-config from 8.0.2 to 8.1.1 (#416) ([d057914](https://github.com/readmeio/rdme/commit/d057914)), closes [#416](https://github.com/readmeio/rdme/issues/416)
* chore(deps-dev): bump eslint from 8.3.0 to 8.6.0 (#418) ([4dbab7c](https://github.com/readmeio/rdme/commit/4dbab7c)), closes [#418](https://github.com/readmeio/rdme/issues/418)
* chore(deps-dev): bump jest from 27.4.3 to 27.4.5 (#419) ([e9557bb](https://github.com/readmeio/rdme/commit/e9557bb)), closes [#419](https://github.com/readmeio/rdme/issues/419)
* chore(deps-dev): bump prettier from 2.5.0 to 2.5.1 (#415) ([6007eb1](https://github.com/readmeio/rdme/commit/6007eb1)), closes [#415](https://github.com/readmeio/rdme/issues/415)
* chore(deps): bump actions/setup-node from 2.5.0 to 2.5.1 (#413) ([c5a159f](https://github.com/readmeio/rdme/commit/c5a159f)), closes [#413](https://github.com/readmeio/rdme/issues/413)
* chore(deps): bump cli-table from 0.3.9 to 0.3.11 (#414) ([4b2c140](https://github.com/readmeio/rdme/commit/4b2c140)), closes [#414](https://github.com/readmeio/rdme/issues/414)
* chore(deps): bump oas from 17.3.1 to 17.4.0 (#417) ([45841dc](https://github.com/readmeio/rdme/commit/45841dc)), closes [#417](https://github.com/readmeio/rdme/issues/417)
* chore(deps): bump parse-link-header from 1.0.1 to 2.0.0 (#412) ([8557a1d](https://github.com/readmeio/rdme/commit/8557a1d)), closes [#412](https://github.com/readmeio/rdme/issues/412)
* chore(deps): upgrading oas-related deps (#420) ([02f748d](https://github.com/readmeio/rdme/commit/02f748d)), closes [#420](https://github.com/readmeio/rdme/issues/420)
* fix(openapi): error handling for incorrect project and version flags (#411) ([431a7db](https://github.com/readmeio/rdme/commit/431a7db)), closes [#411](https://github.com/readmeio/rdme/issues/411)
* refactor(open/openapi/validate): return promises, fix tests (#410) ([8b9ad4b](https://github.com/readmeio/rdme/commit/8b9ad4b)), closes [#410](https://github.com/readmeio/rdme/issues/410)



## <small>6.1.3 (2021-12-17)</small>

* fix(openapi): return rejected `Promise` if spec uploads fail (#409) ([e282b54](https://github.com/readmeio/rdme/commit/e282b54)), closes [#409](https://github.com/readmeio/rdme/issues/409)



## <small>6.1.2 (2021-12-16)</small>

* ci: drop the npm@7 requirement before installing deps in ci (#408) ([fd7dace](https://github.com/readmeio/rdme/commit/fd7dace)), closes [#408](https://github.com/readmeio/rdme/issues/408)
* docs: add/improve our command warnings (#406) ([2228c2c](https://github.com/readmeio/rdme/commit/2228c2c)), closes [#406](https://github.com/readmeio/rdme/issues/406)



## <small>6.1.1 (2021-12-13)</small>

* docs: add docs on validation, fix TOC (#405) ([d433c2f](https://github.com/readmeio/rdme/commit/d433c2f)), closes [#405](https://github.com/readmeio/rdme/issues/405)
* feat(versions): stringify JSON for `--raw` option (#404) ([ce651e9](https://github.com/readmeio/rdme/commit/ce651e9)), closes [#404](https://github.com/readmeio/rdme/issues/404)



## 6.0.0 (2021-12-03)

* docs: removing a dead link from the readme ([4b5308f](https://github.com/readmeio/rdme/commit/4b5308f))
* docs: updating the readme to reflect our coming OpenAPI 3.1 support ([321d94b](https://github.com/readmeio/rdme/commit/321d94b))
* feat: adding support for OpenAPI 3.1 (#378) ([2a6a240](https://github.com/readmeio/rdme/commit/2a6a240)), closes [#378](https://github.com/readmeio/rdme/issues/378)
* feat: overhauling the help screen generator so it's consistent everywhere (#397) ([69fadd3](https://github.com/readmeio/rdme/commit/69fadd3)), closes [#397](https://github.com/readmeio/rdme/issues/397)
* feat: swapping out the colors library for chalk (#396) ([7f252ae](https://github.com/readmeio/rdme/commit/7f252ae)), closes [#396](https://github.com/readmeio/rdme/issues/396)
* chore: removing string templating where are aren't inserting vars ([738b70d](https://github.com/readmeio/rdme/commit/738b70d))
* chore(deps-dev): bump jest from 27.2.4 to 27.3.1 (#383) ([0a0ae53](https://github.com/readmeio/rdme/commit/0a0ae53)), closes [#383](https://github.com/readmeio/rdme/issues/383)
* chore(deps-dev): bump jest from 27.3.1 to 27.4.2 (#393) ([ad8f623](https://github.com/readmeio/rdme/commit/ad8f623)), closes [#393](https://github.com/readmeio/rdme/issues/393)
* chore(deps-dev): bump jest from 27.4.2 to 27.4.3 (#400) ([2053211](https://github.com/readmeio/rdme/commit/2053211)), closes [#400](https://github.com/readmeio/rdme/issues/400)
* chore(deps-dev): bump nock from 13.1.3 to 13.1.4 (#381) ([6322c30](https://github.com/readmeio/rdme/commit/6322c30)), closes [#381](https://github.com/readmeio/rdme/issues/381)
* chore(deps-dev): bump nock from 13.1.4 to 13.2.1 (#394) ([c4f0f72](https://github.com/readmeio/rdme/commit/c4f0f72)), closes [#394](https://github.com/readmeio/rdme/issues/394)
* chore(deps-dev): bump prettier from 2.4.1 to 2.5.0 (#391) ([718ef53](https://github.com/readmeio/rdme/commit/718ef53)), closes [#391](https://github.com/readmeio/rdme/issues/391)
* chore(deps-dev): upgrading eslint and @readme/eslint-config ([b2f91ef](https://github.com/readmeio/rdme/commit/b2f91ef))
* chore(deps): bump actions/checkout from 2.3.4 to 2.3.5 (#382) ([905a553](https://github.com/readmeio/rdme/commit/905a553)), closes [#382](https://github.com/readmeio/rdme/issues/382)
* chore(deps): bump actions/checkout from 2.3.5 to 2.4.0 (#390) ([fa35d15](https://github.com/readmeio/rdme/commit/fa35d15)), closes [#390](https://github.com/readmeio/rdme/issues/390)
* chore(deps): bump actions/setup-node from 2.4.1 to 2.5.0 (#392) ([de533c5](https://github.com/readmeio/rdme/commit/de533c5)), closes [#392](https://github.com/readmeio/rdme/issues/392)
* chore(deps): bump cli-table from 0.3.1 to 0.3.9 (#395) ([f2552f2](https://github.com/readmeio/rdme/commit/f2552f2)), closes [#395](https://github.com/readmeio/rdme/issues/395)
* chore(deps): bump node-fetch from 2.6.5 to 2.6.6 (#385) ([f1dc3e0](https://github.com/readmeio/rdme/commit/f1dc3e0)), closes [#385](https://github.com/readmeio/rdme/issues/385)
* chore(deps): bump open from 8.2.1 to 8.4.0 (#384) ([3f0eaa7](https://github.com/readmeio/rdme/commit/3f0eaa7)), closes [#384](https://github.com/readmeio/rdme/issues/384)
* chore(deps): bump tmp-promise from 3.0.2 to 3.0.3 (#379) ([9fb4bef](https://github.com/readmeio/rdme/commit/9fb4bef)), closes [#379](https://github.com/readmeio/rdme/issues/379)
* ci: cleaning up the codeql workflow ([660b925](https://github.com/readmeio/rdme/commit/660b925))



## 5.2.0 (2021-10-05)

* chore: cleaning up some funky test logic ([3144e64](https://github.com/readmeio/rdme/commit/3144e64))
* chore(deps-dev): bump @readme/eslint-config from 7.1.1 to 7.2.2 (#377) ([0e55604](https://github.com/readmeio/rdme/commit/0e55604)), closes [#377](https://github.com/readmeio/rdme/issues/377)
* chore(deps-dev): bump jest from 27.2.0 to 27.2.4 (#372) ([c726b18](https://github.com/readmeio/rdme/commit/c726b18)), closes [#372](https://github.com/readmeio/rdme/issues/372)
* chore(deps): bump actions/setup-node from 2.4.0 to 2.4.1 (#370) ([73d217d](https://github.com/readmeio/rdme/commit/73d217d)), closes [#370](https://github.com/readmeio/rdme/issues/370)
* chore(deps): bump node-fetch from 2.6.1 to 2.6.5 (#373) ([fd383f9](https://github.com/readmeio/rdme/commit/fd383f9)), closes [#373](https://github.com/readmeio/rdme/issues/373)
* chore(deps): bump oas-normalize from 4.0.1 to 4.0.2 (#374) ([8cdefcc](https://github.com/readmeio/rdme/commit/8cdefcc)), closes [#374](https://github.com/readmeio/rdme/issues/374)
* chore(deps): bump oas-normalize from 4.0.2 to 4.0.3 (#376) ([58d6ac4](https://github.com/readmeio/rdme/commit/58d6ac4)), closes [#376](https://github.com/readmeio/rdme/issues/376)
* ci: ignoring table-layout from dependabot because its now an esm-only pkg ([94bbcbe](https://github.com/readmeio/rdme/commit/94bbcbe))
* fix: allow customers to define the slug in the metadata (#375) ([137411d](https://github.com/readmeio/rdme/commit/137411d)), closes [#375](https://github.com/readmeio/rdme/issues/375)
* docs: adding a code of conduct ([35023d7](https://github.com/readmeio/rdme/commit/35023d7))



## <small>5.1.4 (2021-09-16)</small>

* chore(deps-dev): bumping deps ([3c59ca1](https://github.com/readmeio/rdme/commit/3c59ca1))
* chore(deps): bumping the oas dep ([398d492](https://github.com/readmeio/rdme/commit/398d492))
* docs: adding a security policy ([8686a3e](https://github.com/readmeio/rdme/commit/8686a3e))



## <small>5.1.3 (2021-09-01)</small>

* chore(deps-dev): bump @readme/eslint-config from 6.0.0 to 6.1.0 (#366) ([b0dde02](https://github.com/readmeio/rdme/commit/b0dde02)), closes [#366](https://github.com/readmeio/rdme/issues/366)
* chore(deps-dev): bump jest from 27.0.6 to 27.1.0 (#365) ([3bcf8e1](https://github.com/readmeio/rdme/commit/3bcf8e1)), closes [#365](https://github.com/readmeio/rdme/issues/365)
* chore(deps-dev): removing conventional-changelog-cli in favor of npx ([f6d25b4](https://github.com/readmeio/rdme/commit/f6d25b4))
* chore(deps): bump oas from 14.3.1 to 14.4.0 (#364) ([31dbd7b](https://github.com/readmeio/rdme/commit/31dbd7b)), closes [#364](https://github.com/readmeio/rdme/issues/364)
* chore(deps): bump oas-normalize from 4.0.0 to 4.0.1 (#367) ([d48dedd](https://github.com/readmeio/rdme/commit/d48dedd)), closes [#367](https://github.com/readmeio/rdme/issues/367)
* ci: ignoring node-fetch updates because its now a pure esm package ([cc7aaca](https://github.com/readmeio/rdme/commit/cc7aaca))



## <small>5.1.2 (2021-08-26)</small>

* chore(deps): upgrading oas-normalize to resolve validation quirks (#362) ([27ab077](https://github.com/readmeio/rdme/commit/27ab077)), closes [#362](https://github.com/readmeio/rdme/issues/362)
* perf: stream bundled OpenAPI file instead of sending it wholesale (#361) ([8fbf131](https://github.com/readmeio/rdme/commit/8fbf131)), closes [#361](https://github.com/readmeio/rdme/issues/361)



## <small>5.1.1 (2021-08-26)</small>

* fix: don't send header values that are 'undefined' (#360) ([ae03c1e](https://github.com/readmeio/rdme/commit/ae03c1e)), closes [#360](https://github.com/readmeio/rdme/issues/360)



## 5.1.0 (2021-08-25)

* docs: update language to be more OpenAPI forward (#359) ([75636e9](https://github.com/readmeio/rdme/commit/75636e9)), closes [#359](https://github.com/readmeio/rdme/issues/359)
* chore(deps-dev): bump nock from 13.1.1 to 13.1.3 (#355) ([afe507f](https://github.com/readmeio/rdme/commit/afe507f)), closes [#355](https://github.com/readmeio/rdme/issues/355)
* chore(deps): bump actions/setup-node from 2.3.0 to 2.4.0 (#354) ([068a9d6](https://github.com/readmeio/rdme/commit/068a9d6)), closes [#354](https://github.com/readmeio/rdme/issues/354)
* chore(deps): bump form-data from 2.3.3 to 4.0.0 (#358) ([a3f9075](https://github.com/readmeio/rdme/commit/a3f9075)), closes [#358](https://github.com/readmeio/rdme/issues/358)
* chore(deps): bump oas from 14.0.0 to 14.3.1 (#356) ([8f10391](https://github.com/readmeio/rdme/commit/8f10391)), closes [#356](https://github.com/readmeio/rdme/issues/356)
* chore(deps): bump oas-normalize from 3.0.4 to 3.0.5 (#357) ([2eb3dda](https://github.com/readmeio/rdme/commit/2eb3dda)), closes [#357](https://github.com/readmeio/rdme/issues/357)
* ci: updating the dependabot label ([9428fa3](https://github.com/readmeio/rdme/commit/9428fa3))



## 5.0.0 (2021-08-20)

* feat: add $ref bundling to OpenAPI/Swagger command (#342) ([af3c7c2](https://github.com/readmeio/rdme/commit/af3c7c2)), closes [#342](https://github.com/readmeio/rdme/issues/342)
* feat: add version selection to all relevant commands (#344) ([d797d09](https://github.com/readmeio/rdme/commit/d797d09)), closes [#344](https://github.com/readmeio/rdme/issues/344)
* feat: Adds pagination to the OpenAPI command (#353) ([fb6ec65](https://github.com/readmeio/rdme/commit/fb6ec65)), closes [#353](https://github.com/readmeio/rdme/issues/353)
* feat: making the docs command recursive by default (#343) ([a7a5caa](https://github.com/readmeio/rdme/commit/a7a5caa)), closes [#343](https://github.com/readmeio/rdme/issues/343)
* chore(deps-dev): bumping dev deps ([a2446ec](https://github.com/readmeio/rdme/commit/a2446ec))
* chore(deps): bump actions/setup-node from 2.2.0 to 2.3.0 (#346) ([31cc6f2](https://github.com/readmeio/rdme/commit/31cc6f2)), closes [#346](https://github.com/readmeio/rdme/issues/346)
* chore(deps): bumping deps ([237961d](https://github.com/readmeio/rdme/commit/237961d))
* chore(deps): running npm audit ([e622ea2](https://github.com/readmeio/rdme/commit/e622ea2))
* chore(deps): upgrading oas and oas-normalize ([cfad0f5](https://github.com/readmeio/rdme/commit/cfad0f5))
* fix: command position sorting within the help screen (#341) ([14e26d4](https://github.com/readmeio/rdme/commit/14e26d4)), closes [#341](https://github.com/readmeio/rdme/issues/341)
* fix: replace `request-promise-native` with `node-fetch` (#352) ([74bad7d](https://github.com/readmeio/rdme/commit/74bad7d)), closes [#352](https://github.com/readmeio/rdme/issues/352)
* docs: minor changes to the readme ([25a909b](https://github.com/readmeio/rdme/commit/25a909b))



## 4.0.0 (2021-07-09)

> 🚨 With this release we no longer support Node 10.

* chore: directory spring cleaning (#327) ([314e74b](https://github.com/readmeio/rdme/commit/314e74b)), closes [#327](https://github.com/readmeio/rdme/issues/327)
* chore: re-running prettier to fix failing CI ([1e332be](https://github.com/readmeio/rdme/commit/1e332be))
* chore: running npm audit (#339) ([db0fcfd](https://github.com/readmeio/rdme/commit/db0fcfd)), closes [#339](https://github.com/readmeio/rdme/issues/339)
* chore(deps-dev): bump @readme/eslint-config from 3.4.0 to 4.0.0 ([#229](https://github.com/readmeio/rdme/issues/229), [#239](https://github.com/readmeio/rdme/issues/239), [#246](https://github.com/readmeio/rdme/issues/246), [#253](https://github.com/readmeio/rdme/issues/253), [#261](https://github.com/readmeio/rdme/issues/261), [#273](https://github.com/readmeio/rdme/issues/273))
* chore(deps-dev): bump conventional-changelog-cli from 2.0.34 to 2.1.1 ([#237](https://github.com/readmeio/rdme/issues/237), [#257](https://github.com/readmeio/rdme/issues/257))
* chore(deps-dev): bump eslint from 7.5.0 to 7.12.1 ([#228](https://github.com/readmeio/rdme/issues/228), [#242](https://github.com/readmeio/rdme/issues/242), [#244](https://github.com/readmeio/rdme/issues/244), [#254](https://github.com/readmeio/rdme/issues/254), [#260](https://github.com/readmeio/rdme/issues/260), [#271](https://github.com/readmeio/rdme/issues/271), [#276](https://github.com/readmeio/rdme/issues/276))
* chore(deps-dev): bump jest from 26.1.0 to 27.0.6 ([#226](https://github.com/readmeio/rdme/issues/226), [#233](https://github.com/readmeio/rdme/issues/233), [#235](https://github.com/readmeio/rdme/issues/235), [#255](https://github.com/readmeio/rdme/issues/255), [#258](https://github.com/readmeio/rdme/issues/258), [#337](https://github.com/readmeio/rdme/issues/337))
* chore(deps-dev): bump nock from 13.0.2 to 13.0.5 ([#227](https://github.com/readmeio/rdme/issues/227), [#236](https://github.com/readmeio/rdme/issues/236), [#259](https://github.com/readmeio/rdme/issues/259))
* chore(deps-dev): bump prettier from 2.0.5 to 2.3.2 ([#238](https://github.com/readmeio/rdme/issues/238), [#248](https://github.com/readmeio/rdme/issues/248), [#265](https://github.com/readmeio/rdme/issues/265), [#335](https://github.com/readmeio/rdme/issues/335))
* chore(deps): bump actions/checkout from v2.3.2 to v2.3.4 ([#250](https://github.com/readmeio/rdme/issues/250), [#266](https://github.com/readmeio/rdme/issues/266))
* chore(deps): bump actions/setup-node from 2.1.5 to  (#336) ([c71e982](https://github.com/readmeio/rdme/commit/c71e982)), closes
* chore(deps): bump actions/setup-node from v1 to 2.2.0 ([#232](https://github.com/readmeio/rdme/issues/232), [#256](https://github.com/readmeio/rdme/issues/256), [#274](https://github.com/readmeio/rdme/issues/274), [#291](https://github.com/readmeio/rdme/issues/291), [#336](https://github.com/readmeio/rdme/issues/336))
* chore(deps): bump command-line-usage from 6.1.0 to 6.1.1 (#262) ([b531b96](https://github.com/readmeio/rdme/commit/b531b96)), closes [#262](https://github.com/readmeio/rdme/issues/262)
* chore(deps): bump config from 3.3.1 to 3.3.2 ([#249](https://github.com/readmeio/rdme/issues/249), [#263](https://github.com/readmeio/rdme/issues/263))
* chore(deps): bump gray-matter from 4.0.2 to 4.0.3 (#305) ([1ce24ea](https://github.com/readmeio/rdme/commit/1ce24ea)), closes [#305](https://github.com/readmeio/rdme/issues/305)
* chore(deps): bump hosted-git-info from 2.6.0 to 2.8.9 (#311) ([52e97bd](https://github.com/readmeio/rdme/commit/52e97bd)), closes [#311](https://github.com/readmeio/rdme/issues/311)
* chore(deps): bump node-fetch from 2.6.0 to 2.6.1 (#243) ([3446002](https://github.com/readmeio/rdme/commit/3446002)), closes [#243](https://github.com/readmeio/rdme/issues/243)
* chore(deps): bump node-notifier from 8.0.0 to 8.0.1 (#268) ([14b8bd5](https://github.com/readmeio/rdme/commit/14b8bd5)), closes [#268](https://github.com/readmeio/rdme/issues/268)
* chore(deps): bump oas from 3.5.6 to 13.0.4  ([#240](https://github.com/readmeio/rdme/issues/240), [#247](https://github.com/readmeio/rdme/issues/247), [#334](https://github.com/readmeio/rdme/issues/334))
* chore(deps): bump open from 7.1.0 to 8.2.1 ([#241](https://github.com/readmeio/rdme/issues/241), [#245](https://github.com/readmeio/rdme/issues/245), [#328](https://github.com/readmeio/rdme/issues/328))
* chore(deps): bump semver from 7.3.2 to 7.3.4 (#269) ([d7e52e5](https://github.com/readmeio/rdme/commit/d7e52e5)), closes [#269](https://github.com/readmeio/rdme/issues/269)
* chore(deps): update actions/checkout requirement to v2.3.2 (#231) ([0aa7704](https://github.com/readmeio/rdme/commit/0aa7704)), closes [#231](https://github.com/readmeio/rdme/issues/231)
* feat: add --recursive option to doc sync command (#313) ([96ea0d8](https://github.com/readmeio/rdme/commit/96ea0d8)), closes [#313](https://github.com/readmeio/rdme/issues/313) [#325](https://github.com/readmeio/rdme/issues/325) [#327](https://github.com/readmeio/rdme/issues/327)
* feat: lowercase filenames to match default slugs (#312) ([5503c04](https://github.com/readmeio/rdme/commit/5503c04)), closes [#312](https://github.com/readmeio/rdme/issues/312)
* docs: adding a license field to the package file ([e5c4768](https://github.com/readmeio/rdme/commit/e5c4768))
* docs: adding a pull request template ([d39fca1](https://github.com/readmeio/rdme/commit/d39fca1))
* fix: catch upload timeouts and return a better error message ([773692b](https://github.com/readmeio/rdme/commit/773692b))
* fix: change docs command to always update all valid docs (#338) ([792a2b2](https://github.com/readmeio/rdme/commit/792a2b2)), closes [#338](https://github.com/readmeio/rdme/issues/338)
* fix: validate files before uploading in swagger command (#332) ([670f9c4](https://github.com/readmeio/rdme/commit/670f9c4)), closes [#332](https://github.com/readmeio/rdme/issues/332)
* feat: dropping support for node 10, expanding coverage to node 14/16 (#325) ([052ed4f](https://github.com/readmeio/rdme/commit/052ed4f)), closes [#325](https://github.com/readmeio/rdme/issues/325)
* feat: rename swagger command to openapi and keep swagger as alias (#333) ([04e7f93](https://github.com/readmeio/rdme/commit/04e7f93)), closes [#333](https://github.com/readmeio/rdme/issues/333)
* style: update ASCII Owlbert (#330) ([a38ee76](https://github.com/readmeio/rdme/commit/a38ee76)), closes [#330](https://github.com/readmeio/rdme/issues/330)
* ci: setting up codeql (#230) ([8c275f5](https://github.com/readmeio/rdme/commit/8c275f5)), closes [#230](https://github.com/readmeio/rdme/issues/230)



## <small>3.8.2 (2020-07-27)</small>

* chore(deps-dev): bump @readme/eslint-config from 3.3.2 to 3.4.0 (#221) ([785f063](https://github.com/readmeio/rdme/commit/785f063)), closes [#221](https://github.com/readmeio/rdme/issues/221)
* chore(deps-dev): bump eslint from 7.4.0 to 7.5.0 (#223) ([eff8079](https://github.com/readmeio/rdme/commit/eff8079)), closes [#223](https://github.com/readmeio/rdme/issues/223)
* chore(deps): bump oas from 3.5.0 to 3.5.4 (#222) ([a660e6a](https://github.com/readmeio/rdme/commit/a660e6a)), closes [#222](https://github.com/readmeio/rdme/issues/222)
* chore(deps): bump oas from 3.5.4 to 3.5.6 (#225) ([81cfa81](https://github.com/readmeio/rdme/commit/81cfa81)), closes [#225](https://github.com/readmeio/rdme/issues/225)
* chore(deps): bump open from 7.0.4 to 7.1.0 (#224) ([72dd166](https://github.com/readmeio/rdme/commit/72dd166)), closes [#224](https://github.com/readmeio/rdme/issues/224)
* chore(deps): bump request-promise-native from 1.0.8 to 1.0.9 (#220) ([4e6ac30](https://github.com/readmeio/rdme/commit/4e6ac30)), closes [#220](https://github.com/readmeio/rdme/issues/220)



## <small>3.8.1 (2020-07-17)</small>

* chore(deps): bump lodash from 4.17.14 to 4.17.19 (#219) ([08d7a09](https://github.com/readmeio/rdme/commit/08d7a09)), closes [#219](https://github.com/readmeio/rdme/issues/219)



## 3.8.0 (2020-07-15)

* feat: overhauling error handling to support the new api error responses (#218) ([0a5e92b](https://github.com/readmeio/rdme/commit/0a5e92b)), closes [#218](https://github.com/readmeio/rdme/issues/218)
* chore(deps-dev): bump @readme/eslint-config from 3.3.0 to 3.3.2 (#213) ([d7f3fcb](https://github.com/readmeio/rdme/commit/d7f3fcb)), closes [#213](https://github.com/readmeio/rdme/issues/213)
* chore(deps-dev): bump eslint from 7.3.1 to 7.4.0 (#215) ([9a5f94b](https://github.com/readmeio/rdme/commit/9a5f94b)), closes [#215](https://github.com/readmeio/rdme/issues/215)
* chore(deps-dev): bump nock from 13.0.0 to 13.0.2 (#214) ([446b8ac](https://github.com/readmeio/rdme/commit/446b8ac)), closes [#214](https://github.com/readmeio/rdme/issues/214)
* chore(deps): bump enquirer from 2.3.5 to 2.3.6 (#217) ([634edea](https://github.com/readmeio/rdme/commit/634edea)), closes [#217](https://github.com/readmeio/rdme/issues/217)
* chore(deps): bump oas from 3.4.6 to 3.5.0 (#216) ([626f05a](https://github.com/readmeio/rdme/commit/626f05a)), closes [#216](https://github.com/readmeio/rdme/issues/216)



## <small>3.7.16 (2020-06-30)</small>

* fix: setting initial data for newVersion when creating a version (#212) ([0fb8ba8](https://github.com/readmeio/rdme/commit/0fb8ba8)), closes [#212](https://github.com/readmeio/rdme/issues/212)
* chore(deps-dev): bump @readme/eslint-config from 3.2.1 to 3.3.0 (#207) ([6fb98e2](https://github.com/readmeio/rdme/commit/6fb98e2)), closes [#207](https://github.com/readmeio/rdme/issues/207)
* chore(deps-dev): bump eslint from 7.2.0 to 7.3.1 (#209) ([6748068](https://github.com/readmeio/rdme/commit/6748068)), closes [#209](https://github.com/readmeio/rdme/issues/209)
* chore(deps-dev): bump jest from 26.0.1 to 26.1.0 (#208) ([f0149dc](https://github.com/readmeio/rdme/commit/f0149dc)), closes [#208](https://github.com/readmeio/rdme/issues/208)
* chore(deps-dev): bump nock from 12.0.3 to 13.0.0 (#211) ([0fb1564](https://github.com/readmeio/rdme/commit/0fb1564)), closes [#211](https://github.com/readmeio/rdme/issues/211)
* ci: updating the dependabot label and commit message formats ([984e239](https://github.com/readmeio/rdme/commit/984e239))
* build(deps-dev): bump @readme/eslint-config from 3.1.3 to 3.2.0 (#202) ([ce0a624](https://github.com/readmeio/rdme/commit/ce0a624)), closes [#202](https://github.com/readmeio/rdme/issues/202)
* build(deps-dev): bump @readme/eslint-config from 3.2.0 to 3.2.1 (#204) ([3f497a0](https://github.com/readmeio/rdme/commit/3f497a0)), closes [#204](https://github.com/readmeio/rdme/issues/204)
* build(deps-dev): bump eslint from 7.1.0 to 7.2.0 (#200) ([5608339](https://github.com/readmeio/rdme/commit/5608339)), closes [#200](https://github.com/readmeio/rdme/issues/200)
* build(deps): bump oas from 3.4.3 to 3.4.4 (#201) ([2eab99f](https://github.com/readmeio/rdme/commit/2eab99f)), closes [#201](https://github.com/readmeio/rdme/issues/201)
* build(deps): bump oas from 3.4.4 to 3.4.6 (#203) ([b4d6d31](https://github.com/readmeio/rdme/commit/b4d6d31)), closes [#203](https://github.com/readmeio/rdme/issues/203)



## <small>3.7.15 (2020-06-03)</small>

* build(deps-dev): bump @readme/eslint-config from 3.1.0 to 3.1.3 (#198) ([feab655](https://github.com/readmeio/rdme/commit/feab655)), closes [#198](https://github.com/readmeio/rdme/issues/198)
* build(deps): bump oas from 3.4.2 to 3.4.3 (#199) ([c2ba83a](https://github.com/readmeio/rdme/commit/c2ba83a)), closes [#199](https://github.com/readmeio/rdme/issues/199)
* ci: create Dependabot config file (#197) ([143d78d](https://github.com/readmeio/rdme/commit/143d78d)), closes [#197](https://github.com/readmeio/rdme/issues/197)
* ci: removing node 14 from tests for now ([ee7b294](https://github.com/readmeio/rdme/commit/ee7b294))
* ci: running tests against node 14 ([36ad006](https://github.com/readmeio/rdme/commit/36ad006))
* chore(deps-dev): upgrading eslint deps to the latest versions ([9a6cfbf](https://github.com/readmeio/rdme/commit/9a6cfbf))
* chore(deps): upgrading oas to the latest release ([6194f26](https://github.com/readmeio/rdme/commit/6194f26))



## <small>3.7.14 (2020-05-26)</small>

* chore(deps-dev): Bump @readme/eslint-config from 3.0.0 to 3.1.0 (#195) ([36382e8](https://github.com/readmeio/rdme/commit/36382e8)), closes [#195](https://github.com/readmeio/rdme/issues/195)
* chore(deps-dev): Bump eslint from 7.0.0 to 7.1.0 (#193) ([aaccb7e](https://github.com/readmeio/rdme/commit/aaccb7e)), closes [#193](https://github.com/readmeio/rdme/issues/193)
* chore(deps): [Security] Bump minimist from 1.2.0 to 1.2.5 (#192) ([5d1b877](https://github.com/readmeio/rdme/commit/5d1b877)), closes [#192](https://github.com/readmeio/rdme/issues/192)
* chore(deps): Bump oas from 3.4.0 to 3.4.1 (#194) ([e41364b](https://github.com/readmeio/rdme/commit/e41364b)), closes [#194](https://github.com/readmeio/rdme/issues/194)



## <small>3.7.13 (2020-05-18)</small>

* chore(deps-dev): Bump @readme/eslint-config from 2.0.4 to 2.0.6 (#183) ([efa1d23](https://github.com/readmeio/rdme/commit/efa1d23)), closes [#183](https://github.com/readmeio/rdme/issues/183)
* chore(deps-dev): Bump @readme/eslint-config from 2.0.6 to 2.1.0 (#185) ([c403ec1](https://github.com/readmeio/rdme/commit/c403ec1)), closes [#185](https://github.com/readmeio/rdme/issues/185)
* chore(deps-dev): Bump @readme/eslint-config from 2.1.0 to 2.2.0 (#187) ([9d0c974](https://github.com/readmeio/rdme/commit/9d0c974)), closes [#187](https://github.com/readmeio/rdme/issues/187)
* chore(deps-dev): Bump conventional-changelog-cli from 2.0.31 to 2.0.34 (#186) ([f586dcf](https://github.com/readmeio/rdme/commit/f586dcf)), closes [#186](https://github.com/readmeio/rdme/issues/186)
* chore(deps-dev): Bump jest from 25.4.0 to 25.5.4 (#182) ([50138d5](https://github.com/readmeio/rdme/commit/50138d5)), closes [#182](https://github.com/readmeio/rdme/issues/182)
* chore(deps-dev): Bump jest from 25.5.4 to 26.0.1 (#188) ([d142fbe](https://github.com/readmeio/rdme/commit/d142fbe)), closes [#188](https://github.com/readmeio/rdme/issues/188)
* chore(deps): Bump oas from 3.2.0 to 3.3.2 (#184) ([48ccb3b](https://github.com/readmeio/rdme/commit/48ccb3b)), closes [#184](https://github.com/readmeio/rdme/issues/184)
* chore(deps): Bump oas from 3.3.2 to 3.4.0 (#190) ([ea7e170](https://github.com/readmeio/rdme/commit/ea7e170)), closes [#190](https://github.com/readmeio/rdme/issues/190)
* chore(deps): Bump open from 7.0.3 to 7.0.4 (#189) ([9da4f7e](https://github.com/readmeio/rdme/commit/9da4f7e)), closes [#189](https://github.com/readmeio/rdme/issues/189)
* style: upgrading @readme/eslint-config and eslint to the latest (#191) ([432d9e0](https://github.com/readmeio/rdme/commit/432d9e0)), closes [#191](https://github.com/readmeio/rdme/issues/191)



## <small>3.7.12 (2020-04-27)</small>

* chore(deps-dev): Bump prettier from 2.0.4 to 2.0.5 (#181) ([a7c6267](https://github.com/readmeio/rdme/commit/a7c6267)), closes [#181](https://github.com/readmeio/rdme/issues/181)
* chore(deps): Bump oas from 3.1.9 to 3.2.0 (#180) ([d93a959](https://github.com/readmeio/rdme/commit/d93a959)), closes [#180](https://github.com/readmeio/rdme/issues/180)



## <small>3.7.11 (2020-04-20)</small>

* chore(deps-dev): Bump @readme/eslint-config from 2.0.3 to 2.0.4 (#177) ([e201154](https://github.com/readmeio/rdme/commit/e201154)), closes [#177](https://github.com/readmeio/rdme/issues/177)
* chore(deps-dev): Bump jest from 25.3.0 to 25.4.0 (#176) ([bdcc1fc](https://github.com/readmeio/rdme/commit/bdcc1fc)), closes [#176](https://github.com/readmeio/rdme/issues/176)
* chore(deps): Bump oas from 3.1.7 to 3.1.9 (#179) ([8168851](https://github.com/readmeio/rdme/commit/8168851)), closes [#179](https://github.com/readmeio/rdme/issues/179)
* chore(deps): Bump semver from 7.2.2 to 7.3.2 (#178) ([e6bd15d](https://github.com/readmeio/rdme/commit/e6bd15d)), closes [#178](https://github.com/readmeio/rdme/issues/178)



## <small>3.7.10 (2020-04-13)</small>

* chore(deps-dev): Bump @readme/eslint-config from 2.0.2 to 2.0.3 (#169) ([1bf8597](https://github.com/readmeio/rdme/commit/1bf8597)), closes [#169](https://github.com/readmeio/rdme/issues/169)
* chore(deps-dev): Bump jest from 25.2.4 to 25.2.7 (#168) ([09787ed](https://github.com/readmeio/rdme/commit/09787ed)), closes [#168](https://github.com/readmeio/rdme/issues/168)
* chore(deps-dev): Bump jest from 25.2.7 to 25.3.0 (#174) ([090ee8b](https://github.com/readmeio/rdme/commit/090ee8b)), closes [#174](https://github.com/readmeio/rdme/issues/174)
* chore(deps-dev): Bump prettier from 2.0.2 to 2.0.3 (#167) ([c5ab394](https://github.com/readmeio/rdme/commit/c5ab394)), closes [#167](https://github.com/readmeio/rdme/issues/167)
* chore(deps-dev): Bump prettier from 2.0.3 to 2.0.4 ([bac0fe6](https://github.com/readmeio/rdme/commit/bac0fe6))
* chore(deps): Bump enquirer from 2.3.2 to 2.3.5 (#175) ([164287a](https://github.com/readmeio/rdme/commit/164287a)), closes [#175](https://github.com/readmeio/rdme/issues/175)
* chore(deps): Bump oas from 3.1.5 to 3.1.6 (#170) ([11980d2](https://github.com/readmeio/rdme/commit/11980d2)), closes [#170](https://github.com/readmeio/rdme/issues/170)
* chore(deps): Bump oas from 3.1.6 to 3.1.7 (#171) ([ffbb758](https://github.com/readmeio/rdme/commit/ffbb758)), closes [#171](https://github.com/readmeio/rdme/issues/171)
* chore(deps): Bump semver from 7.1.3 to 7.2.2 (#173) ([71a0f8d](https://github.com/readmeio/rdme/commit/71a0f8d)), closes [#173](https://github.com/readmeio/rdme/issues/173)



## <small>3.7.9 (2020-03-30)</small>

* chore(deps-dev): Bump @readme/eslint-config from 1.15.0 to 2.0.0 (#158) ([3d32929](https://github.com/readmeio/rdme/commit/3d32929)), closes [#158](https://github.com/readmeio/rdme/issues/158)
* chore(deps-dev): Bump @readme/eslint-config from 2.0.0 to 2.0.2 (#162) ([b40d373](https://github.com/readmeio/rdme/commit/b40d373)), closes [#162](https://github.com/readmeio/rdme/issues/162)
* chore(deps-dev): Bump jest from 25.1.0 to 25.2.4 (#165) ([1da8386](https://github.com/readmeio/rdme/commit/1da8386)), closes [#165](https://github.com/readmeio/rdme/issues/165)
* chore(deps-dev): Bump nock from 12.0.2 to 12.0.3 (#159) ([f9d5946](https://github.com/readmeio/rdme/commit/f9d5946)), closes [#159](https://github.com/readmeio/rdme/issues/159)
* chore(deps-dev): Bump prettier from 2.0.1 to 2.0.2 (#164) ([847cf05](https://github.com/readmeio/rdme/commit/847cf05)), closes [#164](https://github.com/readmeio/rdme/issues/164)
* chore(deps): Bump config from 3.3.0 to 3.3.1 (#163) ([745b254](https://github.com/readmeio/rdme/commit/745b254)), closes [#163](https://github.com/readmeio/rdme/issues/163)
* chore(deps): Bump oas from 3.0.0 to 3.1.0 (#156) ([07ebc85](https://github.com/readmeio/rdme/commit/07ebc85)), closes [#156](https://github.com/readmeio/rdme/issues/156)
* chore(deps): Bump oas from 3.1.0 to 3.1.3 (#157) ([6b30186](https://github.com/readmeio/rdme/commit/6b30186)), closes [#157](https://github.com/readmeio/rdme/issues/157)
* chore(deps): Bump oas from 3.1.3 to 3.1.5 (#161) ([9691dc8](https://github.com/readmeio/rdme/commit/9691dc8)), closes [#161](https://github.com/readmeio/rdme/issues/161)
* docs: Fix link to ReadMe API docs (#160) ([f8c41b8](https://github.com/readmeio/rdme/commit/f8c41b8)), closes [#160](https://github.com/readmeio/rdme/issues/160)



## <small>3.7.8 (2020-03-16)</small>

* chore(deps-dev): Bump @readme/eslint-config from 1.14.0 to 1.15.0 (#153) ([55325bc](https://github.com/readmeio/rdme/commit/55325bc)), closes [#153](https://github.com/readmeio/rdme/issues/153)
* chore(deps): [Security] Bump acorn from 6.4.0 to 6.4.1 (#152) ([eda588c](https://github.com/readmeio/rdme/commit/eda588c)), closes [#152](https://github.com/readmeio/rdme/issues/152)
* chore(deps): Bump oas from 3.0.0 to 3.0.1 (#155) ([d656a89](https://github.com/readmeio/rdme/commit/d656a89)), closes [#155](https://github.com/readmeio/rdme/issues/155)
* chore(deps): Bump table-layout from 1.0.0 to 1.0.1 (#154) ([14827a8](https://github.com/readmeio/rdme/commit/14827a8)), closes [#154](https://github.com/readmeio/rdme/issues/154)



## <small>3.7.7 (2020-03-09)</small>

* chore: minor updates to .npmignore ([7ddc882](https://github.com/readmeio/rdme/commit/7ddc882))
* chore(deps): Bump oas from 2.1.1 to 3.0.0 (#151) ([a9f5a30](https://github.com/readmeio/rdme/commit/a9f5a30)), closes [#151](https://github.com/readmeio/rdme/issues/151)
* chore(deps): Bump open from 7.0.2 to 7.0.3 (#150) ([4d8e57e](https://github.com/readmeio/rdme/commit/4d8e57e)), closes [#150](https://github.com/readmeio/rdme/issues/150)



## <small>3.7.6 (2020-03-02)</small>

* chore(deps-dev): Bump @readme/eslint-config from 1.13.0 to 1.14.0 (#148) ([7068c39](https://github.com/readmeio/rdme/commit/7068c39)), closes [#148](https://github.com/readmeio/rdme/issues/148)
* chore(deps-dev): Bump nock from 12.0.1 to 12.0.2 (#149) ([4733eeb](https://github.com/readmeio/rdme/commit/4733eeb)), closes [#149](https://github.com/readmeio/rdme/issues/149)
* chore(deps): Bump config from 3.2.6 to 3.3.0 (#147) ([1cf5660](https://github.com/readmeio/rdme/commit/1cf5660)), closes [#147](https://github.com/readmeio/rdme/issues/147)
* chore(deps): Bump oas from 2.0.0 to 2.1.1 (#146) ([8aeb601](https://github.com/readmeio/rdme/commit/8aeb601)), closes [#146](https://github.com/readmeio/rdme/issues/146)



## <small>3.7.5 (2020-02-24)</small>

* chore(deps-dev): Bump @readme/eslint-config from 1.12.0 to 1.13.0 (#142) ([2845529](https://github.com/readmeio/rdme/commit/2845529)), closes [#142](https://github.com/readmeio/rdme/issues/142)
* chore(deps-dev): Bump nock from 12.0.0 to 12.0.1 (#144) ([8d649c2](https://github.com/readmeio/rdme/commit/8d649c2)), closes [#144](https://github.com/readmeio/rdme/issues/144)
* chore(deps): Bump config from 3.2.4 to 3.2.6 (#145) ([9b49542](https://github.com/readmeio/rdme/commit/9b49542)), closes [#145](https://github.com/readmeio/rdme/issues/145)
* chore(deps): Bump oas from 1.5.2 to 2.0.0 (#143) ([e04cf2f](https://github.com/readmeio/rdme/commit/e04cf2f)), closes [#143](https://github.com/readmeio/rdme/issues/143)



## <small>3.7.4 (2020-02-17)</small>

* chore(deps-dev): Bump nock from 11.8.2 to 12.0.0 (#140) ([7a819ed](https://github.com/readmeio/rdme/commit/7a819ed)), closes [#140](https://github.com/readmeio/rdme/issues/140)
* chore(deps): Bump configstore from 5.0.0 to 5.0.1 (#139) ([7a79c35](https://github.com/readmeio/rdme/commit/7a79c35)), closes [#139](https://github.com/readmeio/rdme/issues/139)
* chore(deps): Bump request from 2.88.0 to 2.88.2 (#141) ([ae93eff](https://github.com/readmeio/rdme/commit/ae93eff)), closes [#141](https://github.com/readmeio/rdme/issues/141)
* chore(deps): Bump semver from 7.1.2 to 7.1.3 (#138) ([949f0d3](https://github.com/readmeio/rdme/commit/949f0d3)), closes [#138](https://github.com/readmeio/rdme/issues/138)



## <small>3.7.3 (2020-02-12)</small>

* chore(deps-dev): Bump @readme/eslint-config from 1.11.0 to 1.12.0 (#137) ([686fb19](https://github.com/readmeio/rdme/commit/686fb19)), closes [#137](https://github.com/readmeio/rdme/issues/137)
* chore(deps-dev): Bump nock from 11.7.2 to 11.8.2 (#136) ([bb412be](https://github.com/readmeio/rdme/commit/bb412be)), closes [#136](https://github.com/readmeio/rdme/issues/136)
* chore(deps): Bump oas from 1.5.1 to 1.5.2 (#135) ([eadcfa9](https://github.com/readmeio/rdme/commit/eadcfa9)), closes [#135](https://github.com/readmeio/rdme/issues/135)



## <small>3.7.2 (2020-02-09)</small>

* chore(deps-dev): Bump @readme/eslint-config from 1.10.0 to 1.11.0 (#134) ([83a444c](https://github.com/readmeio/rdme/commit/83a444c)), closes [#134](https://github.com/readmeio/rdme/issues/134)
* chore(deps): Bump oas from 1.4.0 to 1.5.1 (#131) ([5aefd47](https://github.com/readmeio/rdme/commit/5aefd47)), closes [#131](https://github.com/readmeio/rdme/issues/131)
* chore(deps): Bump open from 7.0.0 to 7.0.2 (#133) ([0980f35](https://github.com/readmeio/rdme/commit/0980f35)), closes [#133](https://github.com/readmeio/rdme/issues/133)
* chore(deps): Bump semver from 7.1.1 to 7.1.2 (#132) ([2df2c72](https://github.com/readmeio/rdme/commit/2df2c72)), closes [#132](https://github.com/readmeio/rdme/issues/132)



## <small>3.7.1 (2020-01-27)</small>

* chore(deps-dev): upgrading jest to v25 (#129) ([62ecd56](https://github.com/readmeio/rdme/commit/62ecd56)), closes [#129](https://github.com/readmeio/rdme/issues/129)
* chore(deps): Bump oas from 1.3.0 to 1.4.0 (#130) ([7433e6b](https://github.com/readmeio/rdme/commit/7433e6b)), closes [#130](https://github.com/readmeio/rdme/issues/130)



## 3.7.0 (2020-01-21)

* chore(deps-dev): Bump @readme/eslint-config from 1.8.1 to 1.9.0 (#120) ([be0740d](https://github.com/readmeio/rdme/commit/be0740d)), closes [#120](https://github.com/readmeio/rdme/issues/120)
* chore(deps-dev): Bump @readme/eslint-config from 1.9.0 to 1.9.1 (#121) ([dc6b3fd](https://github.com/readmeio/rdme/commit/dc6b3fd)), closes [#121](https://github.com/readmeio/rdme/issues/121)
* chore(deps-dev): Bump @readme/eslint-config from 1.9.1 to 1.10.0 (#126) ([5d902e6](https://github.com/readmeio/rdme/commit/5d902e6)), closes [#126](https://github.com/readmeio/rdme/issues/126)
* chore(deps-dev): Bump nock from 11.7.0 to 11.7.1 (#119) ([d263188](https://github.com/readmeio/rdme/commit/d263188)), closes [#119](https://github.com/readmeio/rdme/issues/119)
* chore(deps-dev): Bump nock from 11.7.1 to 11.7.2 (#123) ([2b59608](https://github.com/readmeio/rdme/commit/2b59608)), closes [#123](https://github.com/readmeio/rdme/issues/123)
* chore(deps): Bump oas from 1.1.0 to 1.2.0 (#122) ([4d708a0](https://github.com/readmeio/rdme/commit/4d708a0)), closes [#122](https://github.com/readmeio/rdme/issues/122)
* chore(deps): Bump oas from 1.2.0 to 1.3.0 (#127) ([ab854de](https://github.com/readmeio/rdme/commit/ab854de)), closes [#127](https://github.com/readmeio/rdme/issues/127)
* feat: drop support for node 8 (#124) ([ca7f6b3](https://github.com/readmeio/rdme/commit/ca7f6b3)), closes [#124](https://github.com/readmeio/rdme/issues/124)



## <small>3.6.2 (2019-12-30)</small>

* chore(deps): [Security] Bump handlebars from 4.1.2 to 4.5.3 (#118) ([62d4b22](https://github.com/readmeio/rdme/commit/62d4b22)), closes [#118](https://github.com/readmeio/rdme/issues/118)
* docs: cleaning up the changelog a bit ([2b2317f](https://github.com/readmeio/rdme/commit/2b2317f))



## <small>3.6.1 (2019-12-23)</small>

* fix: Fix booleans (#117) ([77091c6](https://github.com/readmeio/rdme/commit/77091c6)), closes [#117](https://github.com/readmeio/rdme/issues/117)
* chore(deps-dev): Bump @readme/eslint-config from 1.8.0 to 1.8.1 (#116) ([e433624](https://github.com/readmeio/rdme/commit/e433624)), closes [#116](https://github.com/readmeio/rdme/issues/116)
* chore(deps): Bump oas from 1.0.2 to 1.1.0 (#115) ([00837ac](https://github.com/readmeio/rdme/commit/00837ac)), closes [#115](https://github.com/readmeio/rdme/issues/115)
* chore(deps): Bump semver from 7.0.0 to 7.1.1 (#114) ([6923511](https://github.com/readmeio/rdme/commit/6923511)), closes [#114](https://github.com/readmeio/rdme/issues/114)
* chore(deps-dev): Bump eslint from 6.7.2 to 6.8.0 (#113) ([e920ee8](https://github.com/readmeio/rdme/commit/e920ee8)), closes [#113](https://github.com/readmeio/rdme/issues/113)


## 3.6.0 (2019-12-16)

* docs: creating a changelog (#112) ([e1b4203](https://github.com/readmeio/rdme/commit/e1b4203)), closes [#112](https://github.com/readmeio/rdme/issues/112)
* chore: adding a github action ci shield to the readme ([19d78e4](https://github.com/readmeio/rdme/commit/19d78e4))
* chore: alphabetizing scripts in the package file ([5a6de1c](https://github.com/readmeio/rdme/commit/5a6de1c))
* chore(deps-dev): Bump @readme/eslint-config from 1.3.1 to 1.7.0 (#107) ([1a3f773](https://github.com/readmeio/rdme/commit/1a3f773)), closes [#107](https://github.com/readmeio/rdme/issues/107)
* chore(deps): Bump command-line-usage from 6.0.2 to 6.1.0 (#98) ([3756135](https://github.com/readmeio/rdme/commit/3756135)), closes [#98](https://github.com/readmeio/rdme/issues/98)
* chore(deps-dev): Bump eslint from 6.6.0 to 6.7.1 (#104) ([26c2d5c](https://github.com/readmeio/rdme/commit/26c2d5c)), closes [#104](https://github.com/readmeio/rdme/issues/104)
* chore(deps-dev): Bump eslint from 6.7.1 to 6.7.2 (#106) ([a3ef903](https://github.com/readmeio/rdme/commit/a3ef903)), closes [#106](https://github.com/readmeio/rdme/issues/106)
* chore(deps-dev): Bump eslint-plugin-jest from 23.0.4 to 23.1.1 (#105) ([819f6e8](https://github.com/readmeio/rdme/commit/819f6e8)), closes [#105](https://github.com/readmeio/rdme/issues/105)
* chore(deps-dev): Bump nock from 11.4.0 to 11.7.0 (#97) ([2c4c4cb](https://github.com/readmeio/rdme/commit/2c4c4cb)), closes [#97](https://github.com/readmeio/rdme/issues/97)
* chore(deps): Bump oas from 0.8.18 to 1.0.1 (#102) ([d766f11](https://github.com/readmeio/rdme/commit/d766f11)), closes [#102](https://github.com/readmeio/rdme/issues/102)
* chore(deps-dev): Bump prettier from 1.18.0 to 1.19.1 (#99) ([1901244](https://github.com/readmeio/rdme/commit/1901244)), closes [#99](https://github.com/readmeio/rdme/issues/99)
* chore(deps-dev): loading @readme/eslint-config and resolving issues (#103) ([26a1441](https://github.com/readmeio/rdme/commit/26a1441)), closes [#103](https://github.com/readmeio/rdme/issues/103)
* chore: removing circleci integration ([61f6677](https://github.com/readmeio/rdme/commit/61f6677))
* chore(deps-dev): Bump @readme/eslint-config from 1.7.0 to 1.8.0 (#110) ([c1d245f](https://github.com/readmeio/rdme/commit/c1d245f)), closes [#110](https://github.com/readmeio/rdme/issues/110)
* chore(deps): Bump config from 3.2.3 to 3.2.4 (#93) ([74e1578](https://github.com/readmeio/rdme/commit/74e1578)), closes [#93](https://github.com/readmeio/rdme/issues/93)
* chore(deps): Bump oas from 1.0.1 to 1.0.2 (#109) ([63a02dc](https://github.com/readmeio/rdme/commit/63a02dc)), closes [#109](https://github.com/readmeio/rdme/issues/109)
* chore(deps): Bump open from 6.4.0 to 7.0.0 (#92) ([deceeba](https://github.com/readmeio/rdme/commit/deceeba)), closes [#92](https://github.com/readmeio/rdme/issues/92)
* chore(deps): Bump request-promise-native from 1.0.7 to 1.0.8 (#100) ([fd3612e](https://github.com/readmeio/rdme/commit/fd3612e)), closes [#100](https://github.com/readmeio/rdme/issues/100)
* chore(deps): Bump semver from 6.3.0 to 7.0.0 (#111) ([9aec05a](https://github.com/readmeio/rdme/commit/9aec05a)), closes [#111](https://github.com/readmeio/rdme/issues/111)
* feat: github actions for ci builds ([cf446ee](https://github.com/readmeio/rdme/commit/cf446ee))
* chore(deps-dev): Bump eslint from 6.5.1 to 6.6.0 (#95) ([3a73153](https://github.com/readmeio/rdme/commit/3a73153)), closes [#95](https://github.com/readmeio/rdme/issues/95)
* chore(deps-dev): Bump eslint-config-prettier from 6.4.0 to 6.5.0 (#94) ([ee92f31](https://github.com/readmeio/rdme/commit/ee92f31)), closes [#94](https://github.com/readmeio/rdme/issues/94)



## 3.5.0 (2019-10-16)

* feat: Behavioral updates to API spec uploads and updates. ([f3a24fc](https://github.com/readmeio/rdme/commit/f3a24fc))



## <small>3.4.9 (2019-10-14)</small>

* chore(deps): Bump config from 3.2.2 to 3.2.3 (#86) ([f62750d](https://github.com/readmeio/rdme/commit/f62750d)), closes [#86](https://github.com/readmeio/rdme/issues/86)
* chore(deps-dev): Bump eslint from 6.5.0 to 6.5.1 (#88) ([fde111e](https://github.com/readmeio/rdme/commit/fde111e)), closes [#88](https://github.com/readmeio/rdme/issues/88)
* chore(deps-dev): Bump eslint-config-prettier from 6.3.0 to 6.4.0 (#87) ([4cb93f0](https://github.com/readmeio/rdme/commit/4cb93f0)), closes [#87](https://github.com/readmeio/rdme/issues/87)
* chore(deps-dev): Bump nock from 11.3.5 to 11.4.0 (#91) ([7b807ef](https://github.com/readmeio/rdme/commit/7b807ef)), closes [#91](https://github.com/readmeio/rdme/issues/91)
* chore(deps): Bump oas from 0.8.17 to 0.8.18 (#90) ([16f3685](https://github.com/readmeio/rdme/commit/16f3685)), closes [#90](https://github.com/readmeio/rdme/issues/90)



## <small>3.4.8 (2019-09-30)</small>

* chore(deps): Bump colors from 1.3.3 to 1.4.0 ([49d4293](https://github.com/readmeio/rdme/commit/49d4293))
* chore(deps): Bump enquirer from 2.3.1 to 2.3.2 (#81) ([ea1f7bb](https://github.com/readmeio/rdme/commit/ea1f7bb)), closes [#81](https://github.com/readmeio/rdme/issues/81)
* chore(deps-dev): Bump eslint from 6.3.0 to 6.5.0 ([5bda864](https://github.com/readmeio/rdme/commit/5bda864))
* chore(deps-dev): Bump eslint-config-prettier from 6.2.0 to 6.3.0 (#74) ([76b9230](https://github.com/readmeio/rdme/commit/76b9230)), closes [#74](https://github.com/readmeio/rdme/issues/74)
* chore(deps-dev): Bump nock from 11.3.3 to 11.3.5 ([b52457a](https://github.com/readmeio/rdme/commit/b52457a))



## <small>3.4.7 (2019-09-17)</small>

* fix: Fix semver validation (#78) ([a6c3e83](https://github.com/readmeio/rdme/commit/a6c3e83)), closes [#78](https://github.com/readmeio/rdme/issues/78)



## <small>3.4.6 (2019-09-10)</small>

* chore(deps-dev): Updating the oas dependency. ([4977412](https://github.com/readmeio/rdme/commit/4977412))
* chore: Adding .DS_Store to npmignore ([a59d867](https://github.com/readmeio/rdme/commit/a59d867))



## <small>3.4.5 (2019-09-10)</small>

* chore(deps): Replacing the opn module with open since it was renamed. (#72) ([8bde210](https://github.com/readmeio/rdme/commit/8bde210)), closes [#72](https://github.com/readmeio/rdme/issues/72)
* chore(deps-dev): Bump nock from 10.0.6 to 11.3.3 (#71) ([f280035](https://github.com/readmeio/rdme/commit/f280035)), closes [#71](https://github.com/readmeio/rdme/issues/71)
* chore(deps-dev): Bump eslint-config-prettier from 6.1.0 to 6.2.0 (#70) ([a98f32c](https://github.com/readmeio/rdme/commit/a98f32c)), closes [#70](https://github.com/readmeio/rdme/issues/70)
* chore(deps-dev): Bump eslint-config-prettier from 6.0.0 to 6.1.0 (#63) ([5a66307](https://github.com/readmeio/rdme/commit/5a66307)), closes [#63](https://github.com/readmeio/rdme/issues/63)
* chore(deps): Bump oas from 0.8.15 to 0.8.16 (#64) ([28384a7](https://github.com/readmeio/rdme/commit/28384a7)), closes [#64](https://github.com/readmeio/rdme/issues/64)
* chore(deps-dev): Bump eslint from 6.2.0 to 6.3.0 (#68) ([a115f8b](https://github.com/readmeio/rdme/commit/a115f8b)), closes [#68](https://github.com/readmeio/rdme/issues/68)



## <small>3.4.4 (2019-08-28)</small>

* fix: Properly report OAS validation errors (#67) ([c59f038](https://github.com/readmeio/rdme/commit/c59f038)), closes [#67](https://github.com/readmeio/rdme/issues/67)



## <small>3.4.3 (2019-08-27)</small>

* fix: Check if command is 'oas' before throwing error (#62) ([78f346b](https://github.com/readmeio/rdme/commit/78f346b)), closes [#62](https://github.com/readmeio/rdme/issues/62)
* chore(deps-dev): [Security] Bump eslint-utils from 1.4.0 to 1.4.2 (#66) ([7c74f66](https://github.com/readmeio/rdme/commit/7c74f66)), closes [#66](https://github.com/readmeio/rdme/issues/66)
* chore(deps-dev): Bump jest from 24.8.0 to 24.9.0 (#61) ([e16a7e4](https://github.com/readmeio/rdme/commit/e16a7e4)), closes [#61](https://github.com/readmeio/rdme/issues/61)
* chore(deps-dev): Bump eslint from 5.16.0 to 6.2.0 (#60) ([446e305](https://github.com/readmeio/rdme/commit/446e305)), closes [#60](https://github.com/readmeio/rdme/issues/60)
* chore(deps-dev): Bump eslint-config-airbnb-base from 13.2.0 to 14.0.0 (#59) ([4c3bf3f](https://github.com/readmeio/rdme/commit/4c3bf3f)), closes [#59](https://github.com/readmeio/rdme/issues/59)
* chore: petstore.yaml should not have been committed into master. ([bf9d477](https://github.com/readmeio/rdme/commit/bf9d477))



## <small>3.4.2 (2019-08-08)</small>

* feat: Add x-readme-source header (#58) ([3084bcf](https://github.com/readmeio/rdme/commit/3084bcf)), closes [#58](https://github.com/readmeio/rdme/issues/58)



## <small>3.4.1 (2019-08-08)</small>

* docs: Cleaning up some authentication docs in the readme. ([c75e117](https://github.com/readmeio/rdme/commit/c75e117))
* fix: Version flags (#57) ([e62d55c](https://github.com/readmeio/rdme/commit/e62d55c)), closes [#57](https://github.com/readmeio/rdme/issues/57)



## 3.4.0 (2019-08-05)

* feat: Adding a new `logout` command. ([fa8c355](https://github.com/readmeio/rdme/commit/fa8c355))
* feat: Adding a new `whoami` command. ([1e68955](https://github.com/readmeio/rdme/commit/1e68955))
* docs: Clarifying some of the `help` internals with better property names. ([842f521](https://github.com/readmeio/rdme/commit/842f521))
* refactor: Cleaning up the flow for logging out when not authenticated. ([1be9d86](https://github.com/readmeio/rdme/commit/1be9d86))
* test: Making our unit test descriptions a bit more consistent. ([e16b590](https://github.com/readmeio/rdme/commit/e16b590))



## 3.3.0 (2019-08-02)

* feat: Quality of life improvements. (#49) ([5213eba](https://github.com/readmeio/rdme/pull/49))



## 3.2.0 (2019-07-22)

* 3.2.0 ([33d4cc1](https://github.com/readmeio/rdme/commit/33d4cc1))
* Added error handler to getswaggerversion method ([63bb587](https://github.com/readmeio/rdme/commit/63bb587))
* Added error handling to version requests ([b1fa308](https://github.com/readmeio/rdme/commit/b1fa308))
* added getbyid ([dbb8977](https://github.com/readmeio/rdme/commit/dbb8977))
* Bulk Unit Testing: ([25db007](https://github.com/readmeio/rdme/commit/25db007))
* Bump config from 3.1.0 to 3.2.0 ([277bec8](https://github.com/readmeio/rdme/commit/277bec8))
* Bump config from 3.2.0 to 3.2.1 ([43a158b](https://github.com/readmeio/rdme/commit/43a158b))
* Bump config from 3.2.1 to 3.2.2 ([b486847](https://github.com/readmeio/rdme/commit/b486847))
* Bump enquirer from 2.3.0 to 2.3.1 ([0af9349](https://github.com/readmeio/rdme/commit/0af9349))
* Bump eslint-config-airbnb-base from 13.1.0 to 13.2.0 ([1b86ae0](https://github.com/readmeio/rdme/commit/1b86ae0))
* Bump eslint-plugin-import from 2.18.0 to 2.18.1 ([ac89290](https://github.com/readmeio/rdme/commit/ac89290))
* Bump eslint-plugin-import from 2.18.1 to 2.18.2 ([537dd40](https://github.com/readmeio/rdme/commit/537dd40))
* Bump lodash from 4.17.11 to 4.17.14 ([83c89a5](https://github.com/readmeio/rdme/commit/83c89a5))
* changed header key ([b34abe0](https://github.com/readmeio/rdme/commit/b34abe0))
* CLI functionality for rdme version CRUD ([c786949](https://github.com/readmeio/rdme/commit/c786949))
* CLI updates for version API. WIP ([210c6a9](https://github.com/readmeio/rdme/commit/210c6a9))
* CLI Versioning WIP: ([8f8fe3e](https://github.com/readmeio/rdme/commit/8f8fe3e))
* Completed swagger file testing ([ce79af3](https://github.com/readmeio/rdme/commit/ce79af3))
* Feature complete. Prompt interaction, leverage version API ([2c03217](https://github.com/readmeio/rdme/commit/2c03217))
* Fix review comments: ([f112ea1](https://github.com/readmeio/rdme/commit/f112ea1))
* Fixed ref ([383feb5](https://github.com/readmeio/rdme/commit/383feb5))
* Migrated versionId into main version command, cleaned error handling, fixed fork parseint ([a379ba7](https://github.com/readmeio/rdme/commit/a379ba7))
* Minor fixes: ([7a969e8](https://github.com/readmeio/rdme/commit/7a969e8))
* Modified project readme complete ([17ddfbd](https://github.com/readmeio/rdme/commit/17ddfbd))
* Modified Request: Data streams + JSON do not play well together ([24cbb97](https://github.com/readmeio/rdme/commit/24cbb97))
* Modified swagger implementation for cli v non cli usage ([07454fa](https://github.com/readmeio/rdme/commit/07454fa))
* modified to deal with swagger id ([5b101d3](https://github.com/readmeio/rdme/commit/5b101d3))
* parse int fix for cli args ([d5997b9](https://github.com/readmeio/rdme/commit/d5997b9))
* Prettier clean ([b2a7c05](https://github.com/readmeio/rdme/commit/b2a7c05))
* prompt tests complete ([88d3f8c](https://github.com/readmeio/rdme/commit/88d3f8c))
* readme WIP ([acd3443](https://github.com/readmeio/rdme/commit/acd3443))
* removed depedency on get versions request for update function ([5df0bb8](https://github.com/readmeio/rdme/commit/5df0bb8))
* Removed unnecessary conditional block ([996a4c1](https://github.com/readmeio/rdme/commit/996a4c1))
* removed unnecessary eslint disabled lines ([b17af48](https://github.com/readmeio/rdme/commit/b17af48))
* Test work ([c3a5331](https://github.com/readmeio/rdme/commit/c3a5331))
* wip testing for enquirer ([332c9a4](https://github.com/readmeio/rdme/commit/332c9a4))



## 3.1.0 (2019-06-28)

* 3.1.0 ([653a626](https://github.com/readmeio/rdme/commit/653a626))
* Add some whitespace around command output from swagger ([9f447fa](https://github.com/readmeio/rdme/commit/9f447fa))
* Bump configstore from 4.0.0 to 5.0.0 ([25f4d62](https://github.com/readmeio/rdme/commit/25f4d62))
* Bump eslint from 4.19.1 to 5.16.0 ([3ae4c0d](https://github.com/readmeio/rdme/commit/3ae4c0d))
* Bump eslint-config-airbnb-base from 12.1.0 to 13.1.0 ([2673312](https://github.com/readmeio/rdme/commit/2673312))
* Bump eslint-config-prettier from 4.3.0 to 5.0.0 ([d4d6a36](https://github.com/readmeio/rdme/commit/d4d6a36))
* Bump eslint-config-prettier from 5.0.0 to 6.0.0 ([8075266](https://github.com/readmeio/rdme/commit/8075266))
* Bump eslint-plugin-import from 2.17.3 to 2.18.0 ([31358a7](https://github.com/readmeio/rdme/commit/31358a7))
* Bump gray-matter from 4.0.1 to 4.0.2 ([1eb8f1b](https://github.com/readmeio/rdme/commit/1eb8f1b))
* Bump nock from 9.2.3 to 10.0.6 ([dabe324](https://github.com/readmeio/rdme/commit/dabe324))
* Bump opn from 5.5.0 to 6.0.0 ([8627207](https://github.com/readmeio/rdme/commit/8627207))
* Bump prettier from 1.12.1 to 1.18.0 ([009ecd0](https://github.com/readmeio/rdme/commit/009ecd0))
* Bump request-promise-native from 1.0.5 to 1.0.7 ([6c176ef](https://github.com/readmeio/rdme/commit/6c176ef))
* Changed Post/Put swagger endpoints, updated console message and tests ([5c878df](https://github.com/readmeio/rdme/commit/5c878df))
* copy edit ([87f1146](https://github.com/readmeio/rdme/commit/87f1146))
* Fix prettier ([e1af036](https://github.com/readmeio/rdme/commit/e1af036))
* If an OAS is not supplied, attempt to discover one in the root dir. ([40354c2](https://github.com/readmeio/rdme/commit/40354c2))
* Prettier ([c208328](https://github.com/readmeio/rdme/commit/c208328))
* removed error handling ([47fbfa8](https://github.com/readmeio/rdme/commit/47fbfa8))
* Removing some unnecessary invalid key error handling. ([8425083](https://github.com/readmeio/rdme/commit/8425083))
* Update lib/swagger.js ([bda7316](https://github.com/readmeio/rdme/commit/bda7316))
* Updated formdata key for request payload and key for result endpoint ref ([a62202c](https://github.com/readmeio/rdme/commit/a62202c))
* updated response message from cli ([81ca22c](https://github.com/readmeio/rdme/commit/81ca22c))
* updated style per prettier package ([bddfe73](https://github.com/readmeio/rdme/commit/bddfe73))
* Updating the branch with the latest master. ([4a3a5b8](https://github.com/readmeio/rdme/commit/4a3a5b8))
* Updating the error message that appears when we can't find an OAS. ([33d6f9d](https://github.com/readmeio/rdme/commit/33d6f9d))
* Whoops... my local prettier was out of date ([c03d284](https://github.com/readmeio/rdme/commit/c03d284))



## <small>3.0.2 (2019-06-06)</small>

* [Security] Bump extend from 3.0.1 to 3.0.2 ([dd85ff7](https://github.com/readmeio/rdme/commit/dd85ff7))
* 3.0.2 ([80b1d39](https://github.com/readmeio/rdme/commit/80b1d39))
* Better error messages ([f55f5a6](https://github.com/readmeio/rdme/commit/f55f5a6))
* Bump colors from 1.1.2 to 1.3.3 ([c03c0fe](https://github.com/readmeio/rdme/commit/c03c0fe))
* Bump config from 1.30.0 to 3.1.0 ([161d1d5](https://github.com/readmeio/rdme/commit/161d1d5))
* Bump eslint-config-prettier from 2.9.0 to 4.3.0 ([d08cb15](https://github.com/readmeio/rdme/commit/d08cb15))
* Bump eslint-plugin-import from 2.11.0 to 2.17.3 ([d83d345](https://github.com/readmeio/rdme/commit/d83d345))
* Bump jest from 24.7.1 to 24.8.0 ([bc88c6d](https://github.com/readmeio/rdme/commit/bc88c6d))
* Fix build ([0dcf4f7](https://github.com/readmeio/rdme/commit/0dcf4f7))
* Fix vulnerabilities ([d91ef8b](https://github.com/readmeio/rdme/commit/d91ef8b))
* Update package-lock ([49b4b50](https://github.com/readmeio/rdme/commit/49b4b50))



## 3.0.0 (2019-02-15)

* 3.0.0 ([0461b3a](https://github.com/readmeio/rdme/commit/0461b3a))
* Return with proper exit code on unsuccessful swagger upload ([f410c7c](https://github.com/readmeio/rdme/commit/f410c7c))



## <small>2.2.3 (2019-02-11)</small>

* 2.2.3 ([3afc5f4](https://github.com/readmeio/rdme/commit/3afc5f4))
* Add message when a doc hasn't been updated ([d0d8e9c](https://github.com/readmeio/rdme/commit/d0d8e9c))



## <small>2.2.2 (2018-10-08)</small>

* 2.2.2 ([bb3a75b](https://github.com/readmeio/rdme/commit/bb3a75b))
* Fix `rdme --help` ([6f02cc1](https://github.com/readmeio/rdme/commit/6f02cc1))
* Fix `rdme --version` ([882dc66](https://github.com/readmeio/rdme/commit/882dc66))



## <small>2.2.1 (2018-10-08)</small>

* 2.2.1 ([cffb509](https://github.com/readmeio/rdme/commit/cffb509))
* Add npmignore to reduce module size ([57b81fc](https://github.com/readmeio/rdme/commit/57b81fc))



## 2.2.0 (2018-10-08)

* 2.2.0 ([5698058](https://github.com/readmeio/rdme/commit/5698058))
* Add `rdme login` command ([de88b5e](https://github.com/readmeio/rdme/commit/de88b5e))
* Add `rdme open` command to open the current logged in project ([c00f52d](https://github.com/readmeio/rdme/commit/c00f52d))
* Add some coverage skips for code paths only run in the real cli ([65fde12](https://github.com/readmeio/rdme/commit/65fde12))
* Add some docs to the readme for login and open ([430125f](https://github.com/readmeio/rdme/commit/430125f))
* Add support for 2fa login using --2fa ([1baeec9](https://github.com/readmeio/rdme/commit/1baeec9))
* Ask user for project during login ([495e96a](https://github.com/readmeio/rdme/commit/495e96a))
* Attempt to fix tests on CI ([012381a](https://github.com/readmeio/rdme/commit/012381a))
* Bump packages as per `npm audit` ([234bb18](https://github.com/readmeio/rdme/commit/234bb18))
* Changes requested from Marc ([c850d6b](https://github.com/readmeio/rdme/commit/c850d6b))
* Fetch api key from stored config if set ([8b81dac](https://github.com/readmeio/rdme/commit/8b81dac))
* Prettier ([da1ba62](https://github.com/readmeio/rdme/commit/da1ba62))
* Prettier ([8927368](https://github.com/readmeio/rdme/commit/8927368))
* Prettier ([64df251](https://github.com/readmeio/rdme/commit/64df251))
* Prettier ([64153ba](https://github.com/readmeio/rdme/commit/64153ba))



## 2.1.0 (2018-07-24)

* 2.1.0 ([c81d603](https://github.com/readmeio/rdme/commit/c81d603))
* Add docs for docs:edit command ([896663c](https://github.com/readmeio/rdme/commit/896663c))
* Added docs:edit command and support for subcommands ([36b2059](https://github.com/readmeio/rdme/commit/36b2059))
* Making sure `rdme` on it's own produces the help output ([10ab760](https://github.com/readmeio/rdme/commit/10ab760))
* Prettier ([db80802](https://github.com/readmeio/rdme/commit/db80802))
* Run tests against node8 and node10 on circle ([0666d56](https://github.com/readmeio/rdme/commit/0666d56))



## <small>2.0.4 (2018-05-17)</small>

* 2.0.3 ([06c4218](https://github.com/readmeio/rdme/commit/06c4218))
* 2.0.4 ([410b3b6](https://github.com/readmeio/rdme/commit/410b3b6))
* Fix --version command ([39f3882](https://github.com/readmeio/rdme/commit/39f3882))



## <small>2.0.2 (2018-05-10)</small>

* 2.0.2 ([0df4bbf](https://github.com/readmeio/rdme/commit/0df4bbf))
* By default `config` always includes `development.json` into the config if no NODE_ENV is set ([412f44f](https://github.com/readmeio/rdme/commit/412f44f))



## <small>2.0.1 (2018-05-10)</small>

* 2.0.1 ([f3e1223](https://github.com/readmeio/rdme/commit/f3e1223))
* Fix issue with loading `config` from a node_module ([633b64b](https://github.com/readmeio/rdme/commit/633b64b))



## 2.0.0 (2018-05-09)

* 2.0.0 ([0bc12e1](https://github.com/readmeio/rdme/commit/0bc12e1))
* Add `rdme --version/--help` commands ([5c40ec6](https://github.com/readmeio/rdme/commit/5c40ec6))
* Add better error checking to swagger command ([757873c](https://github.com/readmeio/rdme/commit/757873c))
* Add circleci badge to readme ([2901105](https://github.com/readmeio/rdme/commit/2901105))
* Add circleci config ([3ab0faf](https://github.com/readmeio/rdme/commit/3ab0faf))
* Add code to make sure only docs that have changed are sent over the API ([a441b22](https://github.com/readmeio/rdme/commit/a441b22))
* Add codeclimate reporter id ([ade0186](https://github.com/readmeio/rdme/commit/ade0186))
* Add docs for `rdme docs` command ([5bb0753](https://github.com/readmeio/rdme/commit/5bb0753))
* Add eslint, prettier, editorconfig. Tidy up style ([fb85540](https://github.com/readmeio/rdme/commit/fb85540))
* Add initial implementation of docs syncing to rdme! ([d4e312d](https://github.com/readmeio/rdme/commit/d4e312d))
* Create proxy command `rdme oas` to https://www.npmjs.com/package/oas ([1366735](https://github.com/readmeio/rdme/commit/1366735))
* Fix `command not found` error and change it so that logging is always done in rdme.js ([0441255](https://github.com/readmeio/rdme/commit/0441255))
* Fix config in help ([50294e9](https://github.com/readmeio/rdme/commit/50294e9))
* Lower coverage thresholds so the tests pass for now ([a2537cf](https://github.com/readmeio/rdme/commit/a2537cf))
* Prettier ([6d349ec](https://github.com/readmeio/rdme/commit/6d349ec))
* Prettier ([e102789](https://github.com/readmeio/rdme/commit/e102789))
* Refactor ([2ae2155](https://github.com/readmeio/rdme/commit/2ae2155))
* Remove args[0] from being passed into the command ([b31d461](https://github.com/readmeio/rdme/commit/b31d461))
* Remove notes.md ([ec95d89](https://github.com/readmeio/rdme/commit/ec95d89))
* Remove unused fixtures ([5da2fa4](https://github.com/readmeio/rdme/commit/5da2fa4))
* Remove unused lib files ([b93c9ad](https://github.com/readmeio/rdme/commit/b93c9ad))
* Remove unused packages and simplify a few things ([810c7ee](https://github.com/readmeio/rdme/commit/810c7ee))
* Removing old license file stuff ([af305f2](https://github.com/readmeio/rdme/commit/af305f2))
* Rename a few things ([d6e0cec](https://github.com/readmeio/rdme/commit/d6e0cec))
* Replace mocha with jest ([4f471d6](https://github.com/readmeio/rdme/commit/4f471d6))
* Send code coverage to code climate ([6650dae](https://github.com/readmeio/rdme/commit/6650dae))
* Switch swagger command to use promises ([4d76dab](https://github.com/readmeio/rdme/commit/4d76dab))
* Switch to using `config` module ([0f3bfcd](https://github.com/readmeio/rdme/commit/0f3bfcd))
* Tidy up ([1d191f6](https://github.com/readmeio/rdme/commit/1d191f6))
* Tidying up how validation errors are logged from the API ([173ddb9](https://github.com/readmeio/rdme/commit/173ddb9))



## 1.0.0 (2018-03-13)

* [mock] Style the response URLs a bit better ([3159265](https://github.com/readmeio/rdme/commit/3159265))
* 0.2.0 ([dfc6645](https://github.com/readmeio/rdme/commit/dfc6645))
* 0.2.1 ([aa3d304](https://github.com/readmeio/rdme/commit/aa3d304))
* 0.3.0 ([4615cd8](https://github.com/readmeio/rdme/commit/4615cd8))
* 0.3.1 ([d0898a4](https://github.com/readmeio/rdme/commit/d0898a4))
* 0.7.0 ([e632147](https://github.com/readmeio/rdme/commit/e632147))
* 1.0.0 ([9599b62](https://github.com/readmeio/rdme/commit/9599b62))
* Add a todo ([7fc31b8](https://github.com/readmeio/rdme/commit/7fc31b8))
* Add aliases ([de9d2c6](https://github.com/readmeio/rdme/commit/de9d2c6))
* Add animations when uploading Swagger ([cd14652](https://github.com/readmeio/rdme/commit/cd14652))
* Add dep stoopid ([f4a5814](https://github.com/readmeio/rdme/commit/f4a5814))
* Add dependencies ([c71918f](https://github.com/readmeio/rdme/commit/c71918f))
* Add git init ([c75ed34](https://github.com/readmeio/rdme/commit/c75ed34))
* Add information on module specific configurations ([e46828f](https://github.com/readmeio/rdme/commit/e46828f))
* Add lib/help.js ([cf95b23](https://github.com/readmeio/rdme/commit/cf95b23))
* Add mock command ([d852e54](https://github.com/readmeio/rdme/commit/d852e54))
* Add new services ([078b03f](https://github.com/readmeio/rdme/commit/078b03f))
* Add npm modules for the plane! ([09f66a1](https://github.com/readmeio/rdme/commit/09f66a1))
* Add preliminary support for Postman ([bbcaaac](https://github.com/readmeio/rdme/commit/bbcaaac))
* Add readme ([8457852](https://github.com/readmeio/rdme/commit/8457852))
* Add shebang to bin ([52e3bb5](https://github.com/readmeio/rdme/commit/52e3bb5))
* Add some color! ([463c154](https://github.com/readmeio/rdme/commit/463c154))
* Add support for updating swagger file via the api ([fc56e8f](https://github.com/readmeio/rdme/commit/fc56e8f))
* Add the x-api-token to the Swagger file if it doesn't exist ([823e862](https://github.com/readmeio/rdme/commit/823e862))
* Adding first test for creating of new swagger file via the API ([866d0d1](https://github.com/readmeio/rdme/commit/866d0d1))
* api -> oai ([52930f5](https://github.com/readmeio/rdme/commit/52930f5))
* API -> OAI ([6620492](https://github.com/readmeio/rdme/commit/6620492))
* Better error reporting, new URL ([3ca124e](https://github.com/readmeio/rdme/commit/3ca124e))
* bump ([f9e49c1](https://github.com/readmeio/rdme/commit/f9e49c1))
* Bump swagger-inline ([011860d](https://github.com/readmeio/rdme/commit/011860d))
* Bump swagger-inline version ([e17ac76](https://github.com/readmeio/rdme/commit/e17ac76))
* Bump version ([4b66238](https://github.com/readmeio/rdme/commit/4b66238))
* Bump version ([90459c3](https://github.com/readmeio/rdme/commit/90459c3))
* bumpppp ([9a04b29](https://github.com/readmeio/rdme/commit/9a04b29))
* Categorize all options ([9c2a1a5](https://github.com/readmeio/rdme/commit/9c2a1a5))
* Change binary API ([a50c410](https://github.com/readmeio/rdme/commit/a50c410))
* Check version for min ([7e53a6e](https://github.com/readmeio/rdme/commit/7e53a6e))
* Clean things up ([9ecd670](https://github.com/readmeio/rdme/commit/9ecd670))
* Clean up the new user flow ([e673cc1](https://github.com/readmeio/rdme/commit/e673cc1))
* Create LICENSE.md ([07ddb94](https://github.com/readmeio/rdme/commit/07ddb94))
* Do our best to guess the language in git init ([f7223e2](https://github.com/readmeio/rdme/commit/f7223e2))
* Don't print out stuff on add ([cf421ea](https://github.com/readmeio/rdme/commit/cf421ea))
* End process ([202c719](https://github.com/readmeio/rdme/commit/202c719))
* Extend documentation ([21231b1](https://github.com/readmeio/rdme/commit/21231b1))
* file => spec ([a3532b8](https://github.com/readmeio/rdme/commit/a3532b8))
* First bug fixes ([7282551](https://github.com/readmeio/rdme/commit/7282551))
* First commit for rdme ([4667d86](https://github.com/readmeio/rdme/commit/4667d86))
* First draft of api command line tool ([ab0842f](https://github.com/readmeio/rdme/commit/ab0842f))
* First pass at framework for new version ([817cf56](https://github.com/readmeio/rdme/commit/817cf56))
* fix api ([5b34154](https://github.com/readmeio/rdme/commit/5b34154))
* Fix code samples ([69096d1](https://github.com/readmeio/rdme/commit/69096d1))
* Fix error with swagger being dereferenced ([995c66d](https://github.com/readmeio/rdme/commit/995c66d))
* Fix indentation ([b6b3bc6](https://github.com/readmeio/rdme/commit/b6b3bc6))
* Fix swagger upload now that there's a command before the filename ([43ff7f5](https://github.com/readmeio/rdme/commit/43ff7f5))
* Fix syntax error when action was not found (config was undefined) ([54890b9](https://github.com/readmeio/rdme/commit/54890b9))
* Fix the auto-add ID stuff ([acbeece](https://github.com/readmeio/rdme/commit/acbeece))
* Fix the host action ([9f29da3](https://github.com/readmeio/rdme/commit/9f29da3))
* Flip the command ([8a6d0fc](https://github.com/readmeio/rdme/commit/8a6d0fc))
* Get apis.host working with the new node version ([9f1e8a5](https://github.com/readmeio/rdme/commit/9f1e8a5))
* Get ready for v1! ([23be918](https://github.com/readmeio/rdme/commit/23be918))
* If action isn't found, exit ([9f97b7f](https://github.com/readmeio/rdme/commit/9f97b7f))
* If the swagger file exists, add a suffix ([235be23](https://github.com/readmeio/rdme/commit/235be23))
* Include an empty paths so it validates ([2d5282d](https://github.com/readmeio/rdme/commit/2d5282d))
* Initial commit ([c8fbb4c](https://github.com/readmeio/rdme/commit/c8fbb4c))
* It works ([20711cb](https://github.com/readmeio/rdme/commit/20711cb))
* Logging with stoopid ([50f9d89](https://github.com/readmeio/rdme/commit/50f9d89))
* Make `api` work on the command line ([7a06fa8](https://github.com/readmeio/rdme/commit/7a06fa8))
* Make it so mocha tests can console.log ([1b83359](https://github.com/readmeio/rdme/commit/1b83359))
* Make the shorthand show more stuff ([a0b5459](https://github.com/readmeio/rdme/commit/a0b5459))
* Manage users ([086eb64](https://github.com/readmeio/rdme/commit/086eb64))
* Move to dev dependency ([7020043](https://github.com/readmeio/rdme/commit/7020043))
* New version ([c2b7a48](https://github.com/readmeio/rdme/commit/c2b7a48))
* New version! ([85e3d56](https://github.com/readmeio/rdme/commit/85e3d56))
* No need for quotes ([57fea15](https://github.com/readmeio/rdme/commit/57fea15))
* OAI -> OAS ([520edd1](https://github.com/readmeio/rdme/commit/520edd1))
* Open docs in new window ([bbaefb3](https://github.com/readmeio/rdme/commit/bbaefb3))
* parse url queries ([a8ec03c](https://github.com/readmeio/rdme/commit/a8ec03c))
* Quick docs example ([36f3964](https://github.com/readmeio/rdme/commit/36f3964))
* regular expressions and request methods ([f9a75c1](https://github.com/readmeio/rdme/commit/f9a75c1))
* remove console.log() ([c4eaa8c](https://github.com/readmeio/rdme/commit/c4eaa8c))
* Remove default `push` action ([8136f4c](https://github.com/readmeio/rdme/commit/8136f4c))
* Remove git utils ([16c3ad1](https://github.com/readmeio/rdme/commit/16c3ad1))
* Remove serve ([d56e42d](https://github.com/readmeio/rdme/commit/d56e42d))
* Remove x-api-id stuff ([deb6cdc](https://github.com/readmeio/rdme/commit/deb6cdc))
* Removing openap.is stuff ([cfb683b](https://github.com/readmeio/rdme/commit/cfb683b))
* Rename `push` action to `swagger` ([f6b17a5](https://github.com/readmeio/rdme/commit/f6b17a5))
* Secure dying ([fd46441](https://github.com/readmeio/rdme/commit/fd46441))
* Send as json instead of application/x-www-form-urlencoded ([533f8b8](https://github.com/readmeio/rdme/commit/533f8b8))
* Skip currently failing tests ([79d907c](https://github.com/readmeio/rdme/commit/79d907c))
* Some comments ([1d65131](https://github.com/readmeio/rdme/commit/1d65131))
* Some typos ([cc60181](https://github.com/readmeio/rdme/commit/cc60181))
* Start getting login working ([ededb9a](https://github.com/readmeio/rdme/commit/ededb9a))
* Switch to swagger-inline for finding Swagger files ([5bc4ec6](https://github.com/readmeio/rdme/commit/5bc4ec6))
* Update binary ([8558b94](https://github.com/readmeio/rdme/commit/8558b94))
* Update docs to use new `swagger` action ([1365047](https://github.com/readmeio/rdme/commit/1365047))
* Update LICENSE and README ([c993d08](https://github.com/readmeio/rdme/commit/c993d08))
* Update readme ([2ff1828](https://github.com/readmeio/rdme/commit/2ff1828))
* Update README ([6d5583f](https://github.com/readmeio/rdme/commit/6d5583f))
* Update README.md ([dcaef9d](https://github.com/readmeio/rdme/commit/dcaef9d))
* Update README.md ([cff9ef7](https://github.com/readmeio/rdme/commit/cff9ef7))
* Update README.md ([1a8c5a9](https://github.com/readmeio/rdme/commit/1a8c5a9))
* Update README.md ([3ac72a9](https://github.com/readmeio/rdme/commit/3ac72a9))
* Update the format for generate ([e0b1d0c](https://github.com/readmeio/rdme/commit/e0b1d0c))
* Update the package.json ([05a80a2](https://github.com/readmeio/rdme/commit/05a80a2))
* Upgrade ([337845f](https://github.com/readmeio/rdme/commit/337845f))
* Upgrade ([86e6d8c](https://github.com/readmeio/rdme/commit/86e6d8c))
* Upgrrade swagger-inline ([917d237](https://github.com/readmeio/rdme/commit/917d237))
* Validate swagger files ([4bf6f73](https://github.com/readmeio/rdme/commit/4bf6f73))
* version 0.1.2 ([349ba96](https://github.com/readmeio/rdme/commit/349ba96))
* Weight help items ([fffc107](https://github.com/readmeio/rdme/commit/fffc107))
* Whoops, fixing up api url and making it work ([da021fd](https://github.com/readmeio/rdme/commit/da021fd))



