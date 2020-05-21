#!/bin/bash

# cd to parent dir of this file. Ensures this script can be executed from any directory
scripts_dir_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$scripts_dir_path/.."

# Create build/ dir, or empty it if it exists
if [ ! -d "build" ]; then
  echo making build dir

  mkdir build
else
  echo Clearing existing build dir

  rm -rf build/*
fi

# Copy files to build/ dir
cp -r lambda/ build/
cp package.json package-lock.json build/

# Install NPM dependencies (production only)
cd build

echo "Installing NPM dependencies (prod only)"
npm install --only=production

# Create dist/ dir, or empty it if it exists
cd ..
if [ ! -d "dist" ]; then
  echo making dist dir

  mkdir dist
else
  echo Clearing existing dist dir

  rm -rf dist/*
fi

# Zip contents of build/ dir into dist/lambda.zip
cd build
zip -r ../dist/lambda.zip *

cd ..

# Clean up build dir
rm -rf build