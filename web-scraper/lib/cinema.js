"use strict"

module.exports = {
    findMovies: findMovies
}

const request = require("request-promise")
const cheerio = require("cheerio")

/**
 Takes the url to the cinema page and the dates we want to find movies on. Returns a promise which
 resolves with all movies which are available on those dates according to the cinema page.

 The promise will reject if there are no dates provided, if no movies are available, or if any other
 error occurs during the execution
*/
function findMovies(url, dates) {
    return new Promise(function(resolve, reject) {
        let movies = []
        let options = {
            url: url,
            headers: {"User-Agent": "an222yp@student.lnu.se"}
        }

        request(options).then(function(html) {
            return getMovieTitlesAndID(html)
        }).then(function(identifiers) {
            if (dates.length < 1) {
                reject("No matching dates")
            }

            let moviePromises = []

            dates.forEach(function(date) {
                identifiers.forEach(function(identifier) {
                    moviePromises.push(getMovieShowings(url, date, identifier, movies))
                })
            })

            Promise.all(moviePromises).then(function() {
                let availableMovies = []

                movies.forEach(function(movie) {
                    if (movie.status === 1) {
                        availableMovies.push(movie)
                    }
                })

                if (availableMovies.length < 1) {
                    reject("No movies available")
                } else {
                    resolve(availableMovies)
                }
            }).catch(function(error) {
                reject(error)
            })
        })
    })
}

/**
 Takes the url to the cinema page, the date we are interested in, the identifier object for a
 specific movie, and the array to collect all movies in.

 The function returns a promise which resolves when all movies found is added to the movie array,
 but nothing is passed though the resolve function call.
*/
function getMovieShowings(url, date, identifier, movies) {
    url = url + "/check?day=" + date + "&movie=" + identifier.id

    return new Promise(function(resolve, reject) {
        let options = {
            url: url,
            headers: {"User-Agent": "an222yp@student.lnu.se"}
        }

        request(options).then(function(json) {
            let newMovies = JSON.parse(json)

            newMovies.forEach(function(movie) {
                movie.time = movie.time.substr(0, 2)
                movie.title = identifier.title
                movies.push(movie)
            })

            resolve()
        }).catch(function(error) {
            reject(error)
        })
    })
}

/**
 This function finds all movie alternatives available on the cinema page. It takes the html code
 from the cinema page and analyzes it and returns an array of objects containing the movie id and
 the title.
*/
function getMovieTitlesAndID(html) {
    let options = []
    let analyzer = cheerio.load(html)

    let form = analyzer("select[name=movie]").html()
    analyzer = cheerio.load(form)

    analyzer("option[value]").each(function(i, el) {
        options.push({
            id: analyzer(el).val(),
            title: analyzer(el).text()
        })
    })

    return options
}
