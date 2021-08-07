#!/bin/bash

# cd to parent dir of this file. Ensures this script can be executed from any directory
scripts_dir_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$scripts_dir_path/../.."

# Create build/ dir, or empty it if it exists
if [ ! -d "build-retweeter" ]; then
  echo making build-retweeter dir

  mkdir build-retweeter
else
  echo Clearing existing build-retweeter dir

  rm -rf build-retweeter/*
fi

# Copy files to build/ dir
cp -r src/retweeter/ build-retweeter/
cp -r src/config/ build-retweeter/
cp -r src/lib/ build-retweeter/
cp package.json package-lock.json build-retweeter/

# Install NPM dependencies (production only)
cd build-retweeter

echo "Installing NPM dependencies (prod only)"
npm install --only=production

# Create dist/ dir, or empty it if it exists
if [ ! -d "dist" ]; then
  echo making dist dir

  mkdir dist
fi

# Zip contents of build/ dir into dist/lambda.zip
cd build-retweeter
zip -r ../dist/retweeter.zip *

# Clean up build dir
rm -rf ../build-retweeter