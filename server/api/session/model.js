const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  shortId: Number,
  startsAt: {
    type: Date,
    required: [true, 'startsAt is required']
  },
  // duration in minutes
  duration: {
    type: Number,
    required: [true, 'duration is required']
  },
  capacity: {
    type: Number,
    required: [true, 'capacity is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'teacher is required']
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: [true, 'activity is required']
  },
  bookedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  peoplePresent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

module.exports = mongoose.model('Session', schema)
