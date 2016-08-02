var mongoose = require('mongoose');

var User = mongoose.model('User', {
  resume: { type: Buffer},
  email: String,
  firstname: String,
  lastname: String,
  phone: String,
  birthday: Date,
  address: String,
  city: String,
  cohort: String,
  relocating: String
});

module.exports = User;
