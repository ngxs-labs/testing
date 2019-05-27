#!/usr/bin/env bash

files=(
  devops/definitions.sh
  devops/ci/scripts/semver.sh
  devops/ci/scripts/login-to-git.sh
  devops/ci/scripts/build-test.job.sh
  devops/ci/scripts/bump-version.job.sh
)

for file in ${files[*]}; do
  chmod +x ./${file}
  echo -e "$GREEN Successfully changed mod for file: $file"
done

echo -e "$GREEN Successfully changed mod for all files"
