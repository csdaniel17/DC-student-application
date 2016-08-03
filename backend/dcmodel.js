var mongoose = require('mongoose');

var User = mongoose.model('User', {
  resume: { type: Buffer},
  authenticationTokens: [{ token: String, expiration: Date }],
  email: { type: String, unique: true },
  password: String,
  firstname: String,
  lastname: String,
  phone: String,
  birthday: Date,
  address: String,
  city: String,
  cohort: String,
  relocating: String,
  education: String,
  employment: String,
  loan: String,
  programming: String,
  interest: String,
  plan: String,
  why: String,
  github: String,
  linkedin: String,
  portfolio: String,
  understand: String,
  effortagree: String
});

module.exports = User;
