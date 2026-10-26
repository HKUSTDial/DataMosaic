#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:?Pass the prepared Pages build directory}"
repository_url="${2:?Pass the publishing repository URL}"
test -s "$output_dir/index.html"
test -f "$output_dir/.nojekyll"
test ! -e "$output_dir/.git"

git -C "$output_dir" init --initial-branch=gh-pages
git -C "$output_dir" remote add origin "$repository_url"
if git -C "$output_dir" ls-remote --exit-code --heads origin refs/heads/gh-pages > /dev/null; then
  git -C "$output_dir" fetch --depth=1 origin gh-pages
  git -C "$output_dir" reset --soft FETCH_HEAD
else
  result=$?
  if [[ "$result" -ne 2 ]]; then exit "$result"; fi
fi

git -C "$output_dir" config user.name 'github-actions[bot]'
git -C "$output_dir" config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git -C "$output_dir" add --all
if git -C "$output_dir" diff --cached --quiet; then
  echo 'gh-pages already contains this build.'
else
  git -C "$output_dir" commit -m "Publish website from ${GITHUB_SHA:-local build}"
  git -C "$output_dir" push origin HEAD:refs/heads/gh-pages
fi
