"use strict"

module.exports = {
    presentAlternatives: presentAlternatives,
    presentBookedTable: presentBookedTable
}

/**
 Takes an array of bookings and presents them to the user though the console
*/
function presentAlternatives(bookings) {
    for (let i = 0; i < bookings.length; i += 1) {
        console.log("Alternative #" + (i + 1))
        console.log("Day: " + bookings[i].day)
        console.log("Movie: " + bookings[i].movie.title)
        console.log("Restaurant booking: " + bookings[i].table.from + " to " +
            bookings[i].table.to + "\n")
    }
}

/**
 Takes one booking object and presents the table booked in the object
*/
function presentBookedTable(booking) {
    console.log("Table has been booked from " + booking.table.from + " to " + booking.table.to)
}
