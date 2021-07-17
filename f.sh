#!/bin/bash
set -e
names=()
for rl in docs/*/*/releaseNotes.yml; do
	while read -r name; do
		names+=("$name")
		install -Dm644 "public/$name" "${rl%/releaseNotes.yml}/release-notes/$name"
	done < <(< $rl y2j|jq -r '.items[]|.notes[]|.image'|sed -n 's,^./,,p')
done
rm -f "${names[@]/#/'public/'}"
