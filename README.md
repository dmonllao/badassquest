# Play it

[http://www.davidmonllao.com/badassquest](http://www.davidmonllao.com/badassquest)

[![Play it](https://dmonllao.github.io/badassquest/img/readme-img1.png)](http://www.davidmonllao.com/badassquest)

# Development

No i18n, no i10n, no a11y.

## Requirements
* NPM
* Bower installed globally

<!-- not displayed as a code block under a list unless we add something like this comment -->
    npm install bower -g

## Install

    git clone git://github.com/dmonllao/badassquest.git /somewhere/in/www
    cd /somewhere/in/www
    npm install
    bower install

## Run it locally

You just need to start grunt to watch for CSS changes, it autocompiles and minifies it.

    grunt watch
    google-chrome /somewhere/in/www/index.html

## Other stuff

### Update people pictures
* Download a faces dataset from http://vis-www.cs.umass.edu/lfw/ (e.g. http://vis-www.cs.umass.edu/lfw/lfw.tgz) and extract the zip content to scripts/lfw
* Execute scripts/parse-lfw.sh

### Non-bower dependencies
* https://github.com/nathan-muir/fontawesome-markers
* http://www.geocodezip.com/scripts/v3_epoly.js
* http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/infobox.js

## Credits
* Characted pictures: http://vis-www.cs.umass.edu/lfw/
* ROADMAP styles: http://www.mapstylr.com/style/retro/
* Badass picture: http://www.memegenerator.es
* "Chuck Norris May 2015" by Staff Sgt. Tony Foster - https://www.dvidshub.net/image/1915215/fort-hood-camp-mabry-soldiers-attend-texas-state-prayer-breakfast. Licensed under Public Domain via Commons - https://commons.wikimedia.org/wiki/File:Chuck_Norris_May_2015.jpg#/media/File:Chuck_Norris_May_2015.jpg
* Sounds: https://github.com/mozilla/BrowserQuest - Content is licensed under CC-BY-SA 3.0
