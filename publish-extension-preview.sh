#!/bin/bash

ROOT=$(pwd);

rm -rf $ROOT/open-extension-ready-chrome/webextension
mkdir -p $ROOT/open-extension-ready-chrome/webextension

cd $ROOT/apps
yarn run build

cp -r $ROOT/apps/out/webextension/* $ROOT/open-extension-ready-chrome/webextension

cd $ROOT/open-extension-ready-chrome

npm publish