const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
    unique: true,
    uniqueCaseInsensitive: true
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    }
  ],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: [true, 'center is required']
  }
})

module.exports = mongoose.model('Center', schema)
