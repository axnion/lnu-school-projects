"use strict"

module.exports = {
    findMovies: findMovies
}

const request = require("request-promise")

let movies = []

function findMovies(url, dates) {
    return new Promise(function(resolve, reject) {
        let movieIDs = ["01", "02", "03"]
        let moviePromises = []

        dates.forEach(function(date) {
            movieIDs.forEach(function(movieID) {
                moviePromises.push(getMovieShowings(url, date, movieID))
            })
        })

        Promise.all(moviePromises).then(function() {
            let availableMovies = []

            movies.forEach(function(movie) {
                if (movie.status === 1) {
                    availableMovies.push(movie)
                }
            })

            resolve(availableMovies)
        }).catch(function(error) {
            reject(error)
        })

    })
}

// TODO: Add movie title to the movie object
function getMovieShowings(url, date, movie) {
    url = url + "/check?day=" + date + "&movie=" + movie

    return new Promise(function(resolve, reject) {
        request(url).then(function(json) {
            movies = movies.concat(JSON.parse(json))

            movies.forEach(function(movie) {
                movie.time = movie.time.substr(0, 2)
            })

            resolve()
        }).catch(function(error) {
            reject(error)
        })
    })

}
