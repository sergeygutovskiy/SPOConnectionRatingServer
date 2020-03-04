var express = require("express");
const http = require("http");


const app = express();


app.use(express.urlencoded({ extended: true }));


app.listen(8000, () => {
	console.log("Server is running on 8000!");
});