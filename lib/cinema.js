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
                moviePromises.push(getStatusOnMovieShowings(url, date, movieID))
            })
        })

        Promise.all(moviePromises).then(function() {
            let availableMovies = []

            movies.forEach(function(movie) {
                if(movie.status === 1) {
                    availableMovies.push(movie)
                }
            })

            resolve(availableMovies)
        }).catch(function(error) {
            reject(error)
        })

    })
}

function getStatusOnMovieShowings(url, date, movie) {
    url = url + "/check?day=" + date + "&movie=" + movie

    console.log(url)

    return new Promise(function(resolve, reject) {
        request(url).then(function(json) {
            movies = movies.concat(JSON.parse(json))
            resolve()
        }).catch(function(error) {
            reject(error)
        })
    })

}
