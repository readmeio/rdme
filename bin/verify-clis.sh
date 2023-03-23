#!/bin/bash

# Verify existence of gh and docker CLIs
# https://stackoverflow.com/a/677212
set -e
if ! command -v docker &> /dev/null
then
    echo "docker CLI could not be found"
    exit 1
fi
if ! command -v gh &> /dev/null
then
    echo "gh CLI could not be found"
    exit 1
fi
