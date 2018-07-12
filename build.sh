#!/bin/sh
cd ./frontend && npm run build && \
cd .. && \
rsync -av ./build/ conan@67.205.170.55:~
