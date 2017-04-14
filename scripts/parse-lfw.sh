#!/bin/bash

##
# Update app people pictures.
##

set -e

# This should match Const.picsNum as images will be picked randomly.
NUMFILES=100

currentdir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectroot=$currentdir'/..'

if [ ! -d $currentdir'/lfw' ]; then
    echo "Error: lfw directory is not available, download it from http://vis-www.cs.umass.edu/lfw/ and uncompress it in scripts/"
    exit 1
fi

# Clean up
if [ -d $projectroot'/img/people' ]; then
    rm -rf $projectroot/img/people
fi
mkdir $projectroot/img/people

counter=0
for dirname in $(ls $currentdir/lfw); do

    # We stop once we have enough.
    if [ "$NUMFILES" == "$counter" ]; then
        echo "Done. We got $counter files"
        exit 0
    fi

    dirpath=$currentdir'/lfw/'$dirname
    if [ -d $dirpath ]; then
        cp $dirpath'/'$dirname'_0001.jpg' $projectroot'/img/people/'$counter'.jpg'
        echo "$dirname added"
        let counter+=1
    fi
done

echo 'Done, although strange... lfw should contain more than $NUMFILES var value'
exit 0
