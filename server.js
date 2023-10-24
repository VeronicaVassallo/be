const express = require("express");
const mongoose = require("mongoose");
const postRoute = require("./posts");
const blogpostRoute = require("./routes/blogpostCRUD");
const commentRouter = require("./routes/commentRouter");
const loginRouter = require("./routes/loginRouter");
const githubRoute = require("./routes/githubRoute");
const emailRoute = require("./routes/sendEmail");

const cors = require("cors");
require("dotenv").config();
const PORT = 5050;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/", postRoute);
app.use("/", blogpostRoute);
app.use("/", commentRouter);
app.use("/", loginRouter);
app.use("/", githubRoute);
app.use("/", emailRoute);

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error during db connection"));
db.once("open", () => {
	console.log("Database successfully connected");
});

app.listen(PORT, () => console.log(`Server up and running on port: ${PORT}`));
