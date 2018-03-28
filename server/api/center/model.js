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
    type: String
  },
  address: {
    type: String,
    required: [true, 'address is required']
  },
  loc: {
    type: [Number],
    index: '2dsphere',
    default: [2.333333, 48.866667]
  },
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }]
})

module.exports = mongoose.model('Center', schema)