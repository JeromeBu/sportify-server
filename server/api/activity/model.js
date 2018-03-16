const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  shortId: Number,
  name: {
    type: String,
    required: [true, 'name is required']
  },
  image: {
    type: String
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    }
  ],
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: [true, 'center is required']
  },
  loc: {
    type: [Number],
    index: '2dsphere',
    default: [2.333333, 48.866667]
  }
})

module.exports = mongoose.model('Activity', schema)
