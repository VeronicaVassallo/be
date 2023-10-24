const mongoose = require("mongoose");

const author = new mongoose.Schema(
	{
		nome: {
			type: String,
			required: true,
		},
		cognome: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		dataDiNascita: {
			type: String,
			required: true,
		},
		avatar: {
			type: String,
			required: true,
		},
		idGit: {
			type: String,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

module.exports = mongoose.model("authorShema", author, "authors");
