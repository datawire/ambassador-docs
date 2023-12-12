# Ambassador Documentation

The documentation in this repository is built with [Gatsby](https://www.gatsbyjs.com/), which gives us control and flexibility over the layout.

## Contributing

We welcome all contributions! See [LICENSE](https://raw.githubusercontent.com/datawire/ambassador-docs/master/LICENSE) for applicable terms and conditions.

## Authoring Documentation

If you're authoring the documentation, just edit the Markdown files. You can use GitHub to preview the Markdown.

Strings like `$variable$` are substituted with the values defined in `versions.yml`.

The `doc-links.yml` file is the table of contents (TOC) that appears on the left sidebar.

The `aes-pages.yml` file identifies which pages should be marked as "Ambassador Edge Stack" pages.

## Documentation Infrastructure Notes

The docs in this repository can be "vendored" into other repositories using `git subtree`.
Repositories that do this are encouraged to include some kind of convenience tooling to make syncing the docs easier. For example, the
following Makefile snippet:

```Makefile
pull-docs: ## Update ./docs from https://github.com/datawire/ambassador-docs
	git subtree pull --prefix=docs https://github.com/datawire/ambassador-docs.git master
push-docs: ## Publish ./docs to https://github.com/datawire/ambassador-docs
	git subtree push --prefix=docs git@github.com:datawire/ambassador-docs.git master
.PHONY: pull-docs push-docs
```

The (private) [getambassador.io.git][] repository contains the Gatsby-based toolchain that compiles the docs into website at [https://www.getambassador.io/][].

Other repositories that include the docs as a subtree should get in the habit of doing a `git subtree pull` from their `master` branch
periodically. Documentation for code changes can then be committed right along-side the code changes. When a release is cut, and you are
ready to publicize it, simply do a `git subtree push`.

[ambassador-docs.git]: https://github.com/datawire/ambassador-docs
[getambassador.io.git]: https://github.com/datawire/getambassador.io
[https://www.getambassador.io/]: https://www.getambassador.io/

## Adding Release Notes

To add a Release Notes page for a product version, you should:

1. Add a `releaseNotes.yml` file to the folder for that version of the product under `ambassador-docs/docs`. A template for this file can be found here:

```yaml
# This file should be placed in the folder for the version of the
# product that's meant to be documented. A `/release-notes` page will
# be automatically generated and populated at build time.
#
# Note that an entry needs to be added to the `doc-links.yml` file in
# order to surface the release notes in the table of contents.
#
# The YAML in this file should contain:
#
# changelog: An (optional) URL to the CHANGELOG for the product.
# items: An array of releases with the following attributes:
#     - version: The (optional) version number of the release, if applicable.
#     - date: The date of the release in the format YYYY-MM-DD.
#     - notes: An array of noteworthy changes included in the release, each having the following attributes:
#         - type: The type of change, one of `bugfix`, `feature`, `security` or `change`.
#         - title: A short title of the noteworthy change.
#         - body: >-
#             Two or three sentences describing the change and why it
#             is noteworthy.  This is HTML, not plain text or
#             markdown.  It is handy to use YAML's ">-" feature to
#             allow line-wrapping.
#         - image: >-
#             The URL of an image that visually represents the
#             noteworthy change.  This path is relative to the
#             `release-notes` directory; if this file is
#             `FOO/releaseNotes.yml`, then the image paths are
#             relative to `FOO/release-notes/`.
#         - docs: The path to the documentation page where additional information can be found.

items:
  - version: 1.13.4
    date: '2021-05-13'
    notes:
      - type: security
        title: Envoy 1.15.5
        body: >-
          Emissary-ingress 1.13.4 and Edge Stack 1.13.4 have been
          updated to Envoy 1.15.5, which addresses a high severity
          security vulnerability (CVE-2021-29492). Edge Stack and
          Emissary-ingress can now be configured to reject client
          requests that contain escaped slashes.
        image: ./edge-stack-1.13.4.png
        docs: topics/running/ambassador/#rejecting-client-requests-with-escaped-slashes
```

2. Add an entry to the `doc-links.yml` file to surface the release notes in the table of contents:

```yaml
- title: Release Notes
  link: /release-notes
```

3. If images need to be added, the images should be included in the `ambassador-docs/public` folder.
