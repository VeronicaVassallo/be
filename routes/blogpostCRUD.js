const express = require("express");
const blogPostModel = require("../models/blogPostModel");
const blogPostRouter = express.Router();
const validator = require("../middlewares/validator");
require("dotenv").config();
//Cloudinary
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "imgData",
		format: async (req, file) => "",
		public_id: (req, file) => file.name,
	},
});

const cloudUpload = multer({ storage: cloudStorage });

//POST cover
blogPostRouter.post(
	"/blogposts/cloudUpload",
	cloudUpload.single("urlFile"),
	async (req, res) => {
		try {
			res.status(200).json({ urlFile: req.file.path });
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: "Internal server error" + error,
				error,
			});
		}
	}
);

//POST
blogPostRouter.post("/blogposts/create", validator, async (req, res) => {
	const newPost = new blogPostModel({
		category: req.body.category,
		title: req.body.title,
		cover: req.body.cover,
		readTime: {
			value: Number(req.body.readTime.value),
			unit: req.body.readTime.unit,
		},
		content: req.body.content,
		author: req.body.author,
	});

	try {
		const postRequest = newPost.save();
		res.status(201).send({
			statusCode: 201,
			message: `Record created ${req.body.content}`,
			postRequest,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Internal server error",
			error,
		});
	}
});

//PATCH COVER

blogPostRouter.patch(
	"/blogpost/:blogPostId/cover",
	cloudUpload.single("cover"),
	async (req, res) => {
		const { blogPostId } = req.params;

		try {
			const coverPatched = await blogPostModel.findByIdAndUpdate(blogPostId, {
				cover: req.body.cover.urlFile,
			});

			res.status(200).send({
				statusCode: 200,
				message: "Cover patched",
			});
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: "Error during update" + error,
				error,
			});
		}
	}
);

//GET Ritorna tutti i post
blogPostRouter.get("/blogposts", async (req, res) => {
	const { page = 1, pageSize = 3 } = req.query;
	try {
		const blogposts = await blogPostModel
			.find()
			.populate("author", "nome avatar")
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalPosts = await blogPostModel.count();

		res.status(200).send({
			statusCode: 200,
			currebtPage: Number(page),
			totalPages: Math.ceil(totalPosts / pageSize),
			totalPosts,
			message: `Trovati ${blogposts.length} elementi`,
			blogposts,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno al server",
		});
	}
});

//Get dei post dell'utente loggato
blogPostRouter.get("/blogposts/:idAuthor", async (req, res) => {
	const { page = 1, pageSize = 3 } = req.query;
	const { idAuthor } = req.params;
	try {
		const blogposts = await blogPostModel
			.find({ author: { _id: idAuthor } })
			.populate("author", "nome avatar")
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalPosts = await blogPostModel.count();

		res.status(200).send({
			statusCode: 200,
			currebtPage: Number(page),
			totalPages: Math.ceil(totalPosts / pageSize),
			message: `Trovati ${blogposts.length} elementi`,
			blogposts,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno al server",
		});
	}
});

//DELETE

blogPostRouter.delete("/blogposts/:idpost", async (req, res) => {
	const { idpost } = req.params;

	try {
		const deletePost = await blogPostModel.findByIdAndDelete(idpost);
		res.status(200).send({
			statusCode: 200,
			message: `Deleted author with id: ${idpost}`,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Error during deletion",
		});
	}
});

//PUT

blogPostRouter.put("/blogposts/modify/:idpost", async (req, res) => {
	const { idpost } = req.params;

	try {
		const modifyPost = await blogPostModel.findByIdAndUpdate(idpost, {
			category: req.body.category,
			title: req.body.title,
			cover: req.body.cover,
			readTime: {
				value: Number(req.body.readTime.value),
				unit: req.body.readTime.unit,
			},
			authorData: {
				name: req.body.author.name,
				avatar: req.body.author.avatar,
			},
			content: req.body.content,
			author: req.body.author,
		});
		res.status(200).send({
			statusCode: 200,
			message: `Post with id ${idpost} is updating`,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Error during update",
		});
	}
});

module.exports = blogPostRouter;
