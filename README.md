
# Ambassador Documentation

The documentation in this repository is built with [Gatsby](https://www.gatsbyjs.com/), which gives us control and flexibility over the layout.

## Authoring Documentation

If you're authoring the documentation, just edit the Markdown files. You can use GitHub to preview the Markdown.

Strings like `$variable$` are substituted with the values defined in `versions.yml`.

The `doc-links.yml` file is the table of contents (TOC) that appears on the left sidebar.

The `aes-pages.yml` file identifies which pages should be marked as "Ambassador Edge Stack" pages.

## Documentation Infrastructure Notes

The docs in this repository can be "vendored" into other repositories using `git subtree`.
Repositories that do this are encouraged to include some kind of convenience tooling to make syncing the docs easier.  For example, the
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
periodically.  Documentation for code changes can then be committed right along-side the code changes.  When a release is cut, and you are
ready to publicize it, simply do a `git subtree push`.

[ambassador-docs.git]: https://github.com/datawire/ambassador-docs
[getambassador.io.git]: https://github.com/datawire/getambassador.io
[https://www.getambassador.io/]: https://www.getambassador.io/