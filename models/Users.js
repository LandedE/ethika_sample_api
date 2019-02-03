var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
        email: { type : String , unique : true, required : true},
        first_name: String,
        last_name: String
});

module.exports = mongoose.model("Users", UserSchema);
