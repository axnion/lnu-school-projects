"use strict"

module.exports = {
    findMovies: findMovies
}

const request = require("request-promise")
const cheerio = require("cheerio")

let movies = []

function findMovies(url, dates) {
    return new Promise(function(resolve, reject) {
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
                    moviePromises.push(getMovieShowings(url, date, identifier))
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

function getMovieShowings(url, date, identifier) {
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
            })

            movies = movies.concat(newMovies)

            resolve()
        }).catch(function(error) {
            reject(error)
        })
    })
}

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
