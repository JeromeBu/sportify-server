const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  shortId: Number,
  name: {
    type: String,
    required: [true, 'name is required']
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
  }
})

module.exports = mongoose.model('Activity', schema)
