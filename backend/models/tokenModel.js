const mongoose = require('mongoose');

// Token Schema with DBRef to User
const TokenSchema = new mongoose.Schema({
	userId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User', 
		required: true 
	}, // Reference to User
	tokenNo: { type: String, required: true }, // Token number
}, { timestamps: true });

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;