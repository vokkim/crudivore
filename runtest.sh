#!/usr/bin/env bash
set -e
npm install --silent
./node_modules/.bin/mocha test/*Test.js