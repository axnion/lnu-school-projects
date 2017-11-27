const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const examSchema = new Schema({
  course: { type: String, required: true },
  date: {type: Date, required: true},
  timeSlots: {
      timeSlot: {
        duration: {type: Number, required: true, default: 30},
        studentId: {type: String, required: true},
        startTime: {type: Date},
        endTime: {type: Date}
      }
  }
});


module.exports = mongoose.model('Exam', examSchema);
