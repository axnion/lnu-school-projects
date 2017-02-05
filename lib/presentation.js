"use strict"

module.exports = {
    presentAlternatives: presentAlternatives,
    presentFinalBooking: presentFinalBooking
}

function presentAlternatives(bookings) {
    for (let i = 0; i < bookings.length; i += 1) {
        console.log("Alternative #" + (i + 1))
        console.log("Day: " + bookings[i].day)
        console.log("Movie: " + bookings[i].movie.title)
        console.log("Restaurant booking: " + bookings[i].table.from + ":00 to " +
            bookings[i].table.to + ":00\n")
    }
}

function presentFinalBooking(booking) {
    console.log("Table has been booked from " + booking.table.from + " to " + booking.table.to)
}
