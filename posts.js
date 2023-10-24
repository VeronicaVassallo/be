const express = require("express");
const multer = require("multer");
const AuthorModel = require("./models/authormodel"); //!)
const authorRouter = express.Router();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authormodel = require("./models/authormodel");
require("dotenv").config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "imgData",
		format: async (req, file) => "jpg",
		public_id: (req, file) => file.name,
	},
});

const cloudUpload = multer({ storage: cloudStorage });

//post
authorRouter.post(
	"/authors/cloudUpload",
	cloudUpload.single("avatar"),
	async (req, res) => {
		try {
			res.status(200).json({ avatar: req.file.path });
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: "Internal server error" + error,
				error,
			});
		}
	}
);

//Patch
authorRouter.patch(
	"/authors/:authorId/avatar",
	cloudUpload.single("avatar"),
	async (req, res) => {
		const { authorId } = req.params;

		try {
			const authorPatched = await AuthorModel.findByIdAndUpdate(authorId, {
				avatar: req.body.avatar.avatar,
			});

			res.status(200).send({
				statusCode: 200,
				message: "Author patched",
			});
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: "Error during update" + error.message,
				error,
			});
		}
	}
);

authorRouter.get("/authors", async (req, res) => {
	try {
		const authors = await AuthorModel.find(); //3)

		res.status(200).send({
			statusCode: 200,
			message: `Trovati ${authors.length} elementi`,
			authors,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno al server",
		});
	}
});

authorRouter.post("/authors/create", async (req, res) => {
	const salt = await bcrypt.genSalt(10);
	const hascedPassword = await bcrypt.hash(req.body.password, salt);
	const newAuthor = new AuthorModel({
		nome: req.body.nome,
		cognome: req.body.cognome,
		email: req.body.email,
		password: hascedPassword,
		dataDiNascita: req.body.dataDiNascita,
		avatar: req.body.avatar,
	});

	try {
		const postRequest = await newAuthor.save();

		res.status(201).send({
			statusCode: 201,
			message: "Record created",
			postRequest,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Internal server error",
		});
	}
});

//post con github
authorRouter.post("/authors/create/github", async (req, res) => {
	try {
		const authorGit = await AuthorModel.findOne({ idGit: req.body.idGit });
		if (authorGit) {
			res.status(200).send({
				statusCode: 200,
				message: "Author found",
				authorGit,
			});
		} else {
			const newAuthor = new AuthorModel({
				nome: req.body.nome,
				cognome: req.body.cognome,
				email: req.body.email,
				password: req.body.password,
				dataDiNascita: req.body.dataDiNascita,
				avatar: req.body.avatar,
				idGit: req.body.idGit,
			});
			const postRequest = await newAuthor.save(); //5)
			res.status(201).send({
				statusCode: 201,
				message: "Record created",
				postRequest,
			});
		}
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Internal server error",
		});
	}
});

authorRouter.get("/authors/:authorid", async (req, res) => {
	const { authorid } = req.params;
	try {
		const author = await AuthorModel.findById(authorid);
		let mes = "";
		if (author === null) mes = "Author not found!!!";
		res.status(200).send({
			statusCode: 200,
			message: mes,
			payload: author,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: `Internal server error: ${e.message} `,
		});
	}
});

authorRouter.put("/authors/modify/:authorid", async (req, res) => {
	const { authorid } = req.params;

	try {
		const authorModify = await AuthorModel.findByIdAndUpdate(authorid, {
			nome: req.body.nome,
			cognome: req.body.cognome,
			email: req.body.email,
			password: req.body.password,
			dataDiNascita: req.body.dataDiNascita,
			avatar: req.body.avatar,
		});
		res.status(200).send({
			statusCode: 200,
			message: `Updated author with id: ${authorid} `,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Error during update",
		});
	}
});

/*Metodo DELETE */

authorRouter.delete("/authors/delete/:authorid", async (req, res) => {
	const { authorid } = req.params;

	try {
		const authorDelete = await AuthorModel.findByIdAndDelete(authorid);
		res.status(200).send({
			statusCode: 200,
			message: `Deleted author with id: ${authorid} `,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Error during deletion",
		});
	}
});

//GET restituisce l'utente collegato al token di accesso

authorRouter.get("/me", async (req, res) => {
	try {
		let myToken =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MmU0ZTdiMDYxNThjOWQ4MGZjMTJmYiIsIm5vbWUiOiJWYW5lc3NvIiwiY29nbm9tZSI6IlZhbmVzc2kiLCJlbWFpbCI6IlZhbmVzc29AZ21haWwuY29tIiwiZGF0YURpTmFzY2l0YSI6IjggZ2FpbyAxOTk5IiwiYXZhdGFyIjoiaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vZGIyeHlxZzEzL2ltYWdlL3VwbG9hZC92MTY5NzM4Mzg4Ny9pbWdEYXRhL2JhaWh1b3l5ZXp0anR2eDhwdWRyLmpwZyIsImlhdCI6MTY5NzY0NTc1NCwiZXhwIjoxNjk3NzMyMTU0fQ.qdkXpDgVkHsHtOUyQpMrJJQUCrcbjmGxroC4a9qeMAM";
		let myInfo = jwt.verify(myToken, process.env.JWT_SECRET);
		res.status(200).send({
			statusCode: 200,
			myInfo,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: error,
		});
	}
});

module.exports = authorRouter;
