const express = require("express");
const http    = require("http");
const mysql   = require("mysql");
// const fs = require("fs");
// const FormData = require("form-data");

var requests = require("./requests");

const app = express();
app.use(express.urlencoded({ extended: true }));


const mysqlConfig = {
	host: "us-cdbr-iron-east-04.cleardb.net",
	user: "bfab93c67f2afe",
	password: "435d995d",
	db: "heroku_78b065a4fdc5343"
}


app.get("/", (req, res) => {
	res.send("Hello");
	res.end();
});

app.get("/rating/join", (req, res) => {
	var name = req.query.name;
	var password = req.query.password;
	var realName = req.query.realname;

	// console.log(realName);

	var connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	var query = 'SELECT * FROM `students` WHERE `name`=?';
	connection.query(query, [name], function (error, results, fields) {
		if (results.length == 0) {
			
			console.log(error);

			var query = 'INSERT INTO `students` (name, password, real_name) VALUES (?, ?, ?)';
			connection.query(query, [name, password, realName], function (error, results, fields) {
				if (results != null) {

					console.log(error);

					res.status(200);
					res.send({'id': results.insertId, 'join': 1, 'newPassword': 0});
					res.end();
				}
			});			
		} else {

			// console.log(results[0].id);

			if (password != results[0].password) {

				var query = 'UPDATE students SET password = ? WHERE name = ?';
				connection.query(query, [password, name], function (error) {
					
					console.log(error);

					res.status(200);
					res.send({'id': results[0].id, 'join': 0, 'newPassword': 1});
					res.end();					
				});	
			} else {

				res.status(200);
				res.send({'id': results[0].id, 'join': 0, 'newPassword': 0});
				res.end();
			}
		}
	});

	res.status(200);
	res.send("End");
	res.end();

});


app.get("/rating/get", (req, res) => {
	var connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	var query = 'SELECT * FROM `students`';
	connection.query(query, (error, results) => {
		res.status(200);
		res.send(results);
		res.end();
	});
});

var currentStudentIndex = 0;
var currentLessonIndex = 0;

var students = [];
var lessons = [];

var authCookie = "";
var studentId = 0;

var studentsInfo = [];


function makeRating() {
	var connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	var query = 'SELECT * FROM `students`';
	connection.query(query, (error, results) => {
		students = results;


		students.forEach((student) => {
			studentsInfo.push({
				name: student.name			
			});
		});


		var params = {
			name: students[currentStudentIndex].name,
			password: students[currentStudentIndex].password
		} 

		requests.loginRequest(params, onLoginRequest);
	});
}


function onLoginRequest(results) {
	authCookie = results.cookie;
	studentId  = results.student;

	// if (currentStudentIndex == 0) {
	studentsInfo[currentStudentIndex].id = studentId;
	studentsInfo[currentStudentIndex].midMarks = [];
	studentsInfo[currentStudentIndex].visitsPercentage = [];
	studentsInfo[currentStudentIndex].totalPerformance = 0;
	// } else {
	// 	studentsInfo.push({
	// 		id: studentId,
	// 		midMarks: [],
	// 		visitsPercentage: [],
	// 		totalPerformance: 0
	// 	});
	// }

	var params = {
		student: studentId,
		cookie: authCookie,
		year: "2020",
		month: "02",
	}

	date = new Date();
	console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());

	requests.lessonsAndTeachersRequest(params, onLessonsAndTeachersRequest);
}


function onLessonsAndTeachersRequest(results) {

	lessons = results.lessons;

	var params = {
		student: studentId,
		cookie: authCookie,
		lesson: lessons[currentLessonIndex]			
	}

	requests.exercisesByLessonRequest(params, onExercisesByLessonRequest);

}


function onExercisesByLessonRequest(results) {
	var visits = results.visits;
	var was = results.was;
	var all = results.all;
	// var lesson = results.lesson;
	// var exercises = results.exercises;
	// var teacher = results.teacher;

	var midMark = 0;
	var counter = 0;

	for (var visit in visits) {
		var point = visits[visit][0].point;
		var performance = visits[visit][0].performance;

		
		if (point != null) 
		{
			if (parseInt(point) > 1) 
			{
				midMark += parseInt(point);
				counter++;
			}
		}

		// console.log(performance);

		if (performance != null)
			// console.log(performance);
			studentsInfo[currentStudentIndex].totalPerformance += parseInt(performance);
	}

	if (counter != 0) {
		midMark /= counter;
		midMark =  Math.round(midMark * 100) / 100
	}

	// if (midMark == 0) midMark = 5;

	// console.log(lessons[currentLessonIndex].name + " " + lessons[currentLessonIndex].semester);
	// console.log(midMark + " " + was + "/" + all);
	studentsInfo[currentStudentIndex].midMarks.push(midMark);
	studentsInfo[currentStudentIndex].visitsPercentage.push(Math.round((was / all) * 100) / 100);


	currentLessonIndex += 1;
	if (currentLessonIndex < lessons.length) 
	{
		var params = {
			student: studentId,
			cookie: authCookie,
			lesson: lessons[currentLessonIndex]			
		}

		requests.exercisesByLessonRequest(params, onExercisesByLessonRequest);
	} else 
	{
		currentStudentIndex += 1;
		currentLessonIndex = 0;

		if (currentStudentIndex < students.length) {
			var params = {
				name: students[currentStudentIndex].name,
				password: students[currentStudentIndex].password
			} 

			// console.log(params);

			requests.loginRequest(params, onLoginRequest);
		} else {
			// console.log(studentsInfo);
			onMakeRating();
		}
	}
}


function onMakeRating() {

	var ratingWeights = [];

	studentsInfo.forEach((student) => {
		// console.log(studentsInfo, student, student.midMarks);
		var lessonsCount = student.midMarks.length;	
		var totalMark = 0;
		var totalVisits = 0;
		
		student.midMarks.forEach((mark) => {
			totalMark += mark;
			if (mark == 0) lessonsCount -= 1;
		});

		student.visitsPercentage.forEach((visit) => {
			totalVisits += visit;
		});

		totalVisits = Math.round((totalVisits / student.visitsPercentage.length) * 100) / 100;
		totalMark = Math.round((totalMark / lessonsCount) * 100) / 100;
		ratingWeights.push({
			id: student.id,
			name: student.name,
			midMark: totalMark,
			midVisitsPercentage: totalVisits
		});
	});

	ratingWeights.sort(function(a, b){
	    var keyA = a.midMark * a.midVisitsPercentage,
	        keyB = b.midMark * b.midVisitsPercentage;
	    // Compare the 2 dates
	    if(keyA < keyB) return 1;
	    if(keyA > keyB) return -1;
	    return 0;
	});

	var connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	for (var i = 0; i < ratingWeights.length; i++) 
	{
		student = ratingWeights[i];

		query = 'UPDATE students SET rating=? WHERE name=?';
		connection.query(query, [i + 1, student.name], (error, results) => {
			console.log(error);
		});
	}


	console.log(ratingWeights);
}


app.listen(process.env.PORT || 8080, () => {
	console.log("Server is running");

	// makeRating();
});