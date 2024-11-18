#!/bin/bash

# Verify existence of docker CLI
# https://stackoverflow.com/a/677212
set -e
if ! command -v docker &> /dev/null
then
    echo "docker CLI could not be found"
    exit 1
fi
