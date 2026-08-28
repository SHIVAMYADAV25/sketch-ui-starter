# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versioning
and changelogs for published packages.

Run `pnpm changeset` after making a change that should be released, follow the prompts,
and commit the generated file in `.changeset/`. CI takes care of versioning and publishing
via the `release.yml` workflow.
