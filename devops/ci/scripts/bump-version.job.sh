#!/usr/bin/env bash

echo -e "$GREEN Gonna check if I have to run this job..."

function exitTravis {
  echo -e "$GREEN Regex matched, gonna exit"
  exit 0
}

[[ $TRAVIS_COMMIT_MESSAGE =~ [0-9].[0-9].[0-9] ]] && exitTravis
[[ $TRAVIS_TAG =~ .+ ]] && exitTravis

bumpAction=patch
description=$(echo "$TRAVIS_COMMIT_MESSAGE" | sed -r '/^\s*$/d' | awk '{print tolower($0)}')

for type in breaking, perf, major; do
  if [[ $description =~ ^"$type".* ]]; then
    bumpAction=major
  fi
done

for type in feat, refactor, minor; do
  if [[ $description =~ ^"$type".* ]]; then
    bumpAction=minor
  fi
done

latestVersion=$(cat ./package.json | jq -r ".version")

export VERSION=$(./devops/ci/scripts/semver.sh bump $bumpAction $latestVersion)

echo -e "$GREEN Gonna bump version"

jq ".version=env.VERSION" ./src/package.json > /tmp/tmp.$$.json && mv /tmp/tmp.$$.json ./src/package.json

function pushToGitWithTags {
  echo -e "$GREEN Gonna login to the git using access token"

  ./devops/ci/scripts/login-to-git.sh

  echo -e "$GREEN Gonna push to the git"

  git add .
  git commit -m "$VERSION" --no-verify
  git tag -a "v$VERSION" -m "$VERSION"
  git push origin master && git push origin master --tags
}

pushToGitWithTags
