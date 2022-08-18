# Overview

Tennis match percentage calculation application based on the Name of a player against another player

# Development and Usage

please run `npm install` inorder for this app to run, then use the below **commands** to test and use this application

# Commands
These are the supported commands
```
node app.js --test
node app.js --inline Jack Jill
node app.js --file ./input.csv
```

## Test Command
The following command will load hard coded player date an generate the match output strings formatted correctly
> node app.js --test

## Inline Command
The following command takes in 2 player names, in this case we are using `Jack` and `Jill`, this will output `Jack matches Jill 60%`

> node app.js --inline Jack Jill

## File Command

The following command will take in a file path as the 2nd argument, you may use a local relative or a global path in my case I have used an include file in this directory called `input.csv` 

> node app.js --file ./input.csv

# Author and License Details

- Created by `Dean Van Greunen`
- License `GPL-3.0-or-later` assigned to this project and source code