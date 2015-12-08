#!/bin/bash

##
# This should run from the project root.
##

set -e

# This should match Const.picsNum as images will be picked randomly.
NUMFILES=100

if [ ! -d "scripts/lfw" ]; then
    echo "Error: lfw directory is not available, download it from http://vis-www.cs.umass.edu/lfw/ and uncompress it in scripts/"
    exit 1
fi

# Clean up
if [ -d "img/people" ]; then
    rm img/people/*.jpg
fi

counter=0
for dirname in $(ls scripts/lfw); do

    # We stop once we have enough.
    if [ "$NUMFILES" == "$counter" ]; then
        echo "Done. We got $counter files"
        exit 0
    fi

    dirpath='scripts/lfw/'$dirname
    if [ -d $dirpath ]; then
        cp -f $dirpath'/'$dirname'_0001.jpg' 'img/people/'$counter'.jpg'
        echo "$dirname added"
        let counter+=1
    fi
done

echo 'Done, although strange... lfw should contain more than $NUMFILES var value'
exit 0
