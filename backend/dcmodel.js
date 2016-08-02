var mongoose = require('mongoose');

var User = mongoose.model('User', {
  resume: { type: Buffer}
});
