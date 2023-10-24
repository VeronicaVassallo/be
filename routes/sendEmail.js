const express = require("express");
const { createTransport } = require("nodemailer");
const email = express.Router();

const transporter = createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "jessica6@ethereal.email",
		pass: "Qd98umaWgbyvHB4ymC",
	},
});

email.post("/send-email", async (req, res) => {
	const { subject, text } = req.body;

	const mailOptions = {
		from: "noreply@epicBlog.com",
		to: req.body.to,
		subject,
		text,
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			res.status(500).send("Error while sending email ");
		} else {
			console.log("email is sending!");
			res.status(200).send("Email correctly sent");
		}
	});
});

module.exports = email;
