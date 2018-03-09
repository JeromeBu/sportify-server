const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    unique: true,
    uniqueCaseInsensitive: true
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session"
    }
  ],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Center",
    required: [true, "center is required"]
  }
})

schema.plugin(uniqueValidator, { message: "{PATH}, should be unique" })

module.exports = mongoose.model("Center", schema)
