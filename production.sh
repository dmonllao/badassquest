#!/bin/bash

set -e

# Move to production branch.
git checkout gh-pages

git rebase master
r.js -o build.js
git add built.js
git commit --amend --no-edit

git push origin master
git push -f origin gh-pages

# Return to dev branch.
git checkout master
