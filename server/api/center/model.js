const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  shortId: Number,
  name: {
    type: String,
    required: [true, 'name is required'],
    unique: true,
    uniqueCaseInsensitive: true
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
  ]
})

module.exports = mongoose.model('Center', schema)
