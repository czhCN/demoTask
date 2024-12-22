#! /usr/bin/env bash

source "$HOME/.nvm/nvm.sh"

nvm use && cd backend && npm install && cd ../frontend && npm install && cd ..
