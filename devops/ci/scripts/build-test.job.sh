#!/usr/bin/env bash

docker -v

echo -e "$GREEN Gonna run build and tests for the @ngxs-labs/$NGXS_LABS_PROJECT_NAME"

docker run \
  -v $(pwd):/tmp/src \
  --name $TRAVIS_JOB_ID \
  node:11 /bin/bash -c \
  "mkdir /tmp/build && cp -a /tmp/src/. /tmp/build && cd /tmp/build && yarn --pure-lockfile --non-interactive --no-progress && yarn ci:pipelines"
