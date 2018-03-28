const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  shortId: Number,
  name: {
    type: String,
    required: [true, 'name is required'],
    unique: true,
    uniqueCaseInsensitive: true
  },
  phone: {
    type: String,
    unique: true
  },
  address: {
    type: String,
    required: [true, 'address is required']
  },
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    }
  ],
  loc: {
    type: [Number],
    index: '2dsphere'
  }
})

module.exports = mongoose.model('Center', schema)
