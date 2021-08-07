#!/bin/bash

# cd to parent dir of this file. Ensures this script can be executed from any directory
scripts_dir_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$scripts_dir_path/../.."

# Create build/ dir, or empty it if it exists
if [ ! -d "build" ]; then
  echo making build dir

  mkdir build
else
  echo Clearing existing build dir

  rm -rf build/*
fi

# Copy files to build/ dir
cp -r ww2bot/ build/
cp -r retweeter/ build/
cp -r lib/ build/
cp -r config/ build/
cp -r lib/ build/
cp azuredeploy* build/
cp host.json build/
cp local.settings.json build/
cp package.json package-lock.json build/

# Install NPM dependencies (production only)
cd build

echo "Installing NPM dependencies (prod only)"
npm install

