# -*- fill-column: 100 -*-

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
#         - href: A path from the root to a resource on the getambassador website, takes precedence over a docs link.

items:
  - version: v1+20230601
    date: '2023-06-01'
    notes:
      - type: security
        title: WAF rules v1+20230601
        body: >-
          Initial release of $productName$ Web Application Firewall rules. Rules provide a
          good level of protection  prevent against attacks in the OWASP Top 10 list.
        docs: howtos/web-application-firewalls
