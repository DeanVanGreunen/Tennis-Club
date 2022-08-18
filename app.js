///////////////////////
// IMPORTS
///////////////////////
const { existsSync, readFileSync, writeFile } = require("fs"); // used to access file system -> built in package
const { resolve } = require( "path" ); // used to get full paths from relative paths

///////////////////////
// Magic Functions
///////////////////////


// sorted function, inspired from python3
function sorted(items, kwargs={}) {
    const key = kwargs.key === undefined ? x => x : kwargs.key;
    const reverse = kwargs.reverse === undefined ? false : kwargs.reverse;
    const sortKeys = items.map((item, pos) => [key(item), pos]);
    const comparator =
        Array.isArray(sortKeys[0][0])
        ? ((left, right) => {
            for (var n = 0; n < Math.min(left.length, right.length); n++) {
                const vLeft = left[n], vRight = right[n];
                const order = vLeft == vRight ? 0 : (vLeft > vRight ? 1 : -1);
                if (order != 0) return order;
            }
            return left.length - right.length;
        })
        : ((left, right) => {
            const vLeft = left[0], vRight = right[0];
            const order = vLeft == vRight ? 0 : (vLeft > vRight ? 1 : -1);
            return order;
        });
    sortKeys.sort(comparator);
    if (reverse) sortKeys.reverse();
    return sortKeys.map((order) => items[order[1]]);
}

// removes character from string at said index
function removeByIndex(str,index) {
    return str.slice(0,index) + str.slice(index+1);
}

// Calculates Match Percentage between two tennis players (this has code duplication, but left it in for a clean understandable code)
const CalculatePercentage = (firstname, secondname) => {
    // return "ERROR" if either name is invalid or if either name only have spaces and no letters
    if(firstname == "" || secondname == "" || firstname.replaceAll(" ", "").length == 0 || secondname.replaceAll(" ", "").length == 0){
        return "ERROR";
    }

    // Convert to Lower Case (for case insensitivity)
    firstname = firstname.toLowerCase();
    secondname = secondname.toLowerCase();

    // create match string
    let match_string = `${firstname} matches ${secondname}`;
    // remove spaces (we dont count spaces here), looked at the spec, i see spaces are being skipped in the character count,
    // => technically a space is a character, remove the following line if it needs to be included.
    match_string = match_string.replaceAll(" ", "");

    // create first sum from match string
    let firstcal = "";
    let cache = [];

    // TODO: loop may be optimised
    for(let character of match_string){
        if(!cache.includes(character)){
            let count = match_string.split(character).length - 1;
            firstcal += `${count}`;
            cache.push(character);
        }
    }
    
    // calculate percentage
    let percentage = 0;

    // check if length is odd, used for last caluclation
    let isODD = firstcal.length % 2 !== 0;
    let centered = "";
    if(isODD){
        // get center index
        let index = parseInt(firstcal.length / 2);
        // set center index value
        centered = firstcal[index];
        // remove index from string to make it even
        firstcal = removeByIndex(firstcal, index);
    }

    let secondcal = "";
    for(let i = 0; i < firstcal.length / 2; i++){
        let left = firstcal[i];
        let right = firstcal[(firstcal.length - 1) - i];
        secondcal += (parseInt(left) + parseInt(right)).toString();
    }
    // append center if set
    if(centered) secondcal += centered;

    while(secondcal.length != 2){
        isODD = secondcal.length % 2 !== 0;
        centered = "";
        if(isODD){
            // get center index
            let index = parseInt(secondcal.length / 2);
            // set center index value
            centered = secondcal[index];
            // remove index from string to make it even
            secondcal = removeByIndex(secondcal, index);
        }
    
        secondcal2 = "";
        for(let i = 0; i < secondcal.length / 2; i++){
            let left = secondcal[i];
            let right = secondcal[(secondcal.length - 1) - i];
            secondcal2 += (parseInt(left) + parseInt(right)).toString();
        }
        // append center if set
        if(centered) secondcal2 += centered;

        secondcal = secondcal2;
    }

    // return percentage as string
    return parseInt(secondcal);
};


const GetPlayersGroupByGender = (names) => {
    // init storage arrays
    let males = [];
    let females = [];
    
    // loop through each name provided
    for(let name_and_gender of names){
        // split into name and gender fields
        let _split = name_and_gender.split(",");
        // get player's name
        let name = _split[0];
        // get player's gender either as a 'f' or 'm' and convert to lower case
        let gender =  _split[1].at(-1).toLowerCase();
        // if 'm' add to male, if 'f' add to female array 
        if(gender == "m"){
            males.push(name);
        } else if(gender == "f"){
            females.push(name);
        }
    }
    
    // return players grouped by gender
    return {
        'males': males,
        'females': females,
    };
};

// Create match output string between two tennis players and percentage
const GetMatchString = (firstname, secondname, percentage) => {
    // Generate base output match string
    let output_string = `${firstname} matches ${secondname} ${percentage.toString()}%`;

    // if percentage is larger than 80% then appened ", good match"
    if(percentage > 80) output_string += ", good match";

    // return output string
    return output_string;
};

// Create matches between both sets
const GenerateMatches = (grouped_players) => {
    // output array
    let matches = [];

    // loop through first set
    for(let male of grouped_players['males']){
        // loop through second set
        for(let female of grouped_players['females']){
            // append match to output array
            matches.push([male, female]);
        }
    }

    // return all possible matches between the two sets
    return matches;
};

// transform matches into matches with percentage calculation
const GenerateMatchPercentages = (matches) => {
    // output array
    let computed_matches = [];
    // loop through each match
    for(let match of matches){
        // append match players and their percentage to the output array
        computed_matches.push([
            match[0],
            match[1],
            CalculatePercentage(match[0], match[1])
        ])
    }

    // sorted by percentage DESC and then by alphabetically ASC -> used complex sort function <- sorted function inspired from python3 (see function at top of file)
    computed_matches = sorted(computed_matches, {"key": (team) => {
        return [(- team[2]), team[0], team[1]];
    }});
    
    // return all computed matches with their math percentage
    return computed_matches;
};

///////////////////////
// Entry Point
///////////////////////

// get command line args
let commands = process.argv.slice(2);

// if command has 3 parameter
if(commands.length == 3){
    // handle inline test in format of node app.js Jack Jill
    // user entered
    if(commands[0] == "--inline"){
        let firstname = commands[1];
        let secondname = commands[2];
        console.log(GetMatchString(firstname, secondname, CalculatePercentage(firstname, secondname)));
    }
// if command has 2 parameters
} else if(commands.length == 2){
    // loads a csv file
    if(commands[0] == "--file"){
        let inputfilepath = resolve(commands[1]);
        let outputfilepath = "output.txt";

        if(!existsSync(inputfilepath)){
            console.log(`${inputfilepath} does not exist`);
            return;
        }

        const player_names = readFileSync(inputfilepath).toString().replace(/\r\n/g,'\n').split('\n');
        // group by gender
        const players_grouped_by_gender = GetPlayersGroupByGender(player_names);
        // generate matches
        const matches = GenerateMatches(players_grouped_by_gender);        
        // calculate percentages for each match
        const percentages = GenerateMatchPercentages(matches);
        // generate output string
        const output = percentages.map((match)=>{ return GetMatchString(match[0], match[1], match[2]); });      

        const content = output.join("\n");

        writeFile(outputfilepath, content, { flag: 'a+' }, err => {});
    }
// if command has 1 parameters -> handles test
} else if(commands.length == 1) {
    if(commands[0] == "--test"){
        // player name and gender
        const player_names = [
            "Dean, m",
            "John, m",
            "Josh, m",
            "Jane, f",
            "Erika, f",
            "Sandy, f",
        ];
        console.log("Players");
        console.log(player_names);
        // group by gender
        const players_grouped_by_gender = GetPlayersGroupByGender(player_names);
        // generate matches
        const matches = GenerateMatches(players_grouped_by_gender);        
        console.log("Matches");
        console.log(matches);
        // calculate percentages for each match
        const percentages = GenerateMatchPercentages(matches);
        // generate output string
        const output = percentages.map((match)=>{ return GetMatchString(match[0], match[1], match[2]); });      
        console.log("Calculations");
        console.log(output);
    }
} else {
    console.log("please use the following commands");
    console.log("node app.js --test");
    console.log("node app.js --inline Jack Jill");
    console.log("node app.js --file ./input.csv");
}