#!/bin/bash

# cd to the root directory
scripts_dir_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$scripts_dir_path/../.."

cd build

func azure functionapp publish ww2TwitterBot --node

cd ..

rm -rf build