require("dotenv").config();
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require('moment');
var fs = require("fs");

// This object of methods logs items to the console (if applicable) and log.txt file
const logger = {
    logHeader: function(database, searchTerm) {
        let datetime = new Date();
        fs.appendFile('./log.txt', `\n\n====== ${datetime} =====\nDatabase: ${database}\nSearch for: ${searchTerm}\n`, 'utf8', function(err) {
            if (err) {console.log(`Error occurred: ${err}`)};
        });
    },
    logResults: function(result) {
        console.log(result);
        fs.appendFile('./log.txt', `\n ${result}`, 'utf8', function(err){
            if (err) {console.log(`Error occurred: ${err}`)};
        });
    }
};

// This function performs searches according to the database and searchTerm requested, then logs the results
const searchDatabase = function(database, searchTerm) {
    switch (database) {
        case "concert-this":
            if (searchTerm == '') {searchTerm = 'Enrique Iglesias'};
            logger.logHeader(database, searchTerm);
            var queryUrl = `https://rest.bandsintown.com/artists/${searchTerm}/events?app_id=codingbootcamp`;
            axios.get(queryUrl).then(function(bandsintownResponse) {
                for (key in bandsintownResponse.data) {
                    let num = parseInt(key) + 1;
                    let venueName = bandsintownResponse.data[key].venue.name;
                    let venueCity = bandsintownResponse.data[key].venue.city;
                    let venueDate = moment(bandsintownResponse.data[key].datetime).format('MM/DD/YYYY');
                    logger.logResults(`${num}. ${venueDate} | ${venueCity}: ${venueName}`);
                };
            });
            break;
        case "spotify-this-song":
            if (searchTerm == '') {searchTerm = 'The Sign'};
            logger.logHeader(database, searchTerm);
            const spotify = new Spotify(keys.spotify);
            spotify.search({ type: 'track', query: searchTerm }, function(err, data) {
                if (err) {return console.log(`Error occurred: ${err}`)};
                for (key in data.tracks.items) {
                    let artist = data.tracks.items[key].album.artists[0].name;
                    let link = data.tracks.items[key].external_urls.spotify;
                    let albumName = data.tracks.items[key].name;
                    logger.logResults(`\n”${searchTerm}” by ${artist} \nAlbum: ${albumName} \nLink: ${link}`);
                };
            });
            break;
        case "movie-this":
            if (searchTerm == '') {searchTerm = 'Mr. Nobody'};
            logger.logHeader(database, searchTerm);
            var queryUrl = `http://www.omdbapi.com/?t=${searchTerm}&y=&plot=short&apikey=trilogy`;
            axios.get(queryUrl).then(function(movieResponse) {
                let movie = movieResponse.data;
                logger.logResults(`\n\t${movie.Title} (${movie.Year}), featuring ${movie.Actors}: ${movie.Plot} The movie was released in ${movie.Country} and is available to audiences in ${movie.Language}. The Interview Movie Database gives this movie a ${movie.Ratings[0].Value} while Rotten Tomatoes rates it at ${movie.Ratings[1].Value}.\n`);
            });
            break;
    };
};
    
// This function prompts the user to select a database and searchTerm in order to conduct the search
const startSearch = function() {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do?",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        default: "concert-this",
        name: "userDo"
    }]).then(function(response) {
        if (response.userDo == "do-what-it-says") {
            fs.readFile("./random.txt", "utf8", function(err, fileData) {
                if (err) {return console.log(`Error occurred: ${err}`)};
                let database = fileData.split(",")[0];
                let searchTerm = fileData.split(",")[1];
                searchDatabase(database, searchTerm);
            });
        } else {
            inquirer.prompt([{
                type: "input", 
                message: "Who or what would you like to search for?", 
                name: "searchTerm"
            }]).then(function(searchInput) {
                searchDatabase(response.userDo, searchInput.searchTerm);
            });
        };
    });
};

// This function call gets the party started
startSearch();