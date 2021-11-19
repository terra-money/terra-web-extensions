#!/bin/bash

ROOT=$(pwd);

rm -rf $ROOT/terra-web-extension/unpacked
mkdir -p $ROOT/terra-web-extension/unpacked

cd $ROOT/apps
yarn run build

cp -r $ROOT/apps/out/webextension/* $ROOT/terra-web-extension/unpacked

cd $ROOT/terra-web-extension

npm publish