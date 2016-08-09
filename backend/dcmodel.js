var mongoose = require('mongoose');

var User = mongoose.model('User', {
  resume: { type: Buffer},
  resumeName: String,
  authenticationTokens: [{ token: String, expiration: Date }],
  email: { type: String, unique: true },
  password: String,
  firstname: String,
  lastname: String,
  phone: String,
  birthday: Date,
  howDidYouHear: [String],
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
  effortagree: String,
  forcePasswordReset: { type: Boolean, default: false },
  applicationCompleted: { type: Boolean, default: false },
  codeChallengeCompleted: { type: Boolean, default: false },
  codeChallengeAnswers: {
    '1': Boolean,
    '2': Boolean,
    '3': Boolean,
    '4': Boolean,
    '5': Boolean,
    '6': Boolean,
    '7': Boolean,
    'numCorrect': Number
  },
  interviewScheduled: { type: Boolean, default: false },
  pageLastCompleted: { type: Number, default: 0 }
});

module.exports = User;
