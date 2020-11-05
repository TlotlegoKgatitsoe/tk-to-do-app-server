const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	username: String,
	googleID: String,
	facebookID: String,
	password: String,
	tasks: Array
});

module.exports = mongoose.model( 'User', schema );