# Intro

Badass Quest is an open source framework based on Google Maps API for old-GTA-style games. Unfortunately, on July 2018 Google changed their pricing policy which made [_Badass For President_](http://badassquest.davidmonllao.com), the game that served as example of the framework, unmaintainable (costs changed from zero to $2000AUD a month) and they seem to require a Google developer account with billing enabled even for local development.

| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
|[<img width="1604" alt="Chuck Norris" src="https://github.com/dmonllao/badassquest/raw/master/img/chuck-screen.jpg">](https://github.com/dmonllao/badassquest/raw/master/img/chuck-screen.jpg) Chuck Norris, your friend |[<img width="1604" alt="Fight" src="https://github.com/dmonllao/badassquest/raw/master/img/fight.jpg">](https://github.com/dmonllao/badassquest/raw/master/img/fight.jpg) Fight screen| [<img width="1604" alt="Actions example" src="https://github.com/dmonllao/badassquest/raw/master/img/actions-screen.jpg">](https://github.com/dmonllao/badassquest/raw/master/img/actions-screen.jpg) Actions example |
|[<img width="1604" alt="Map" src="https://github.com/dmonllao/badassquest/raw/master/img/map-screen.jpg">](https://github.com/dmonllao/badassquest/raw/master/img/map-screen.jpg) Map view | [<img width="1604" alt="Extortion" src="https://github.com/dmonllao/badassquest/raw/master/img/extorted-screen.jpg">](https://github.com/dmonllao/badassquest/raw/master/img/extorted-screen.jpg) Extortion | [<img width="1604" alt="Barcelona's new Mayor" src="https://github.com/dmonllao/badassquest/raw/master/img/rule-barcelona.jpg">](https://github.com/dmonllao/badassquest/raw/master/img/rule-barcelona.jpg) Barcelona's new Mayor |

# Play it

[http://badassquest.davidmonllao.com](http://badassquest.davidmonllao.com)

# Development

No i18n, no i10n, no a11y.

## Requirements
* NPM
* Bower installed globally
* A Google account with Google Maps APIs and billing enabled

<!-- not displayed as a code block under a list unless we add something like this comment -->
    npm install -g bower
    npm install -g requirejs

## Install

    git clone git://github.com/dmonllao/badassquest.git /somewhere/in/www
    cd /somewhere/in/www
    npm install
    bower install

## Run it locally

You just need to start grunt to watch for CSS changes, it autocompiles and minifies it.

    grunt watch
    whatever-browser-you-use /somewhere/in/www/index.html

## Other stuff

### Update people pictures
* Download a faces dataset from http://vis-www.cs.umass.edu/lfw/ (e.g. http://vis-www.cs.umass.edu/lfw/lfw.tgz) and extract the zip content to scripts/lfw
* Execute scripts/parse-lfw.sh

### Non-bower dependencies
* https://github.com/nathan-muir/fontawesome-markers
* http://www.geocodezip.com/scripts/v3_epoly.js
* http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/src/infobox.js

## Credits
* Fonts: https://fonts.google.com/?selection.family=Graduate|Passion+One|UnifrakturCook:700&category=Display
* Characted pictures: http://vis-www.cs.umass.edu/lfw/
* ROADMAP styles: http://www.mapstylr.com/style/retro/
* Badass picture: http://www.memegenerator.es
* Foes body: https://opengameart.org/content/red-haired-run-and-jump-sprite-sheets - CC0 1.0 Universal (CC0 1.0) license
* "Chuck Norris May 2015" by Staff Sgt. Tony Foster - https://www.dvidshub.net/image/1915215/fort-hood-camp-mabry-soldiers-attend-texas-state-prayer-breakfast. Licensed under Public Domain via Commons - https://commons.wikimedia.org/wiki/File:Chuck_Norris_May_2015.jpg#/media/File:Chuck_Norris_May_2015.jpg
* Sounds: https://github.com/mozilla/BrowserQuest - Content is licensed under CC-BY-SA 3.0
* Music: Friggo Cz (Sophomore Makeout - Silent Partner https://soundcloud.com/friggo-cz/sophomore-makeout)
