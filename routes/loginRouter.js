const express = require("express");
const loginRouter = express.Router();
const bcrypt = require("bcrypt");
const AuthorModel = require("../models/authormodel");

const jwt = require("jsonwebtoken");
require("dotenv").config();

loginRouter.post("/login", async (req, res) => {
	const user = await AuthorModel.findOne({ email: req.body.email });

	if (!user) {
		return res.status(404).send({
			message: "User don't found",
			statusCode: 404,
		});
	}

	const validPassword = await bcrypt.compare(req.body.password, user.password);

	if (!validPassword) {
		return res.status(400).send({
			statusCode: 400,
			message: "Incorrect Email or password ",
		});
	}

	//generiamo il token:
	const token = jwt.sign(
		{
			id: user._id,
			nome: user.nome,
			cognome: user.cognome,
			email: user.email,
			dataDiNascita: user.dataDiNascita,
			avatar: user.avatar,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: "24h",
		}
	);

	res.header("Authorization", token).status(200).send({
		message: "Login effetuato con successo",
		statusCode: 200,
		token,
	});
});

module.exports = loginRouter;
