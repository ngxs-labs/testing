#!/usr/bin/env bash

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote rm origin
git remote add origin https://arturovt:${ACCESS_TOKEN}@github.com/ngxs-labs/${NGXS_LABS_PROJECT_NAME}.git > /dev/null 2>&1
