const express = require("express");
const http    = require("http");
const mysql   = require("mysql");

var requests 	= require("./requests");
const config = require("./config");

const mysqlConfig = config.mysql;

const app = express();
app.use(express.urlencoded({ extended: true }));


var connection = null;
var params = null;

var ratingWeights = [];

function updateRatingWeights(student, results) {
	// studentsGetsCount++;

	var marks = results.marks;
	var visits = results.visits;
	var totalMark = 0;
	var totalVisits = 0;

	var lessonsWithMarksCount = 0;

	marks.forEach((mark) => { if (mark != 0) lessonsWithMarksCount++ });

	marks.forEach((mark) => { totalMark += mark });
	visits.forEach((visit) => { totalVisits += visit });

	totalMark = Math.round((totalMark / lessonsWithMarksCount) * 100) / 100;
	totalVisits = Math.round((totalVisits / visits.length) * 100) / 100;

	ratingWeights.push({ name: student.name, midMark: totalMark, midVisitsPercentage: totalVisits });
}

app.get("/rating", (req, res) => {

	var name = req.query.name;
	var password = req.query.password;
	var fio = req.query.fio;	
	var group = req.query.group;

	// console.log(realName);

	connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	var query = 'SELECT (id) FROM students';
	connection.query(query, (error, studentsIds) => {
		if (error != null) throw error;

		var studentsCount = studentsIds.length;

		query = 'SELECT * FROM students WHERE name=?';
		connection.query(query, [name], (error, student) => {
			
			if (student.length == 0) {	
				query = 'INSERT INTO students (name, password, fio, group_name) VALUES (?, ?, ?, ?)';
				connection.query(query, [name, password, fio, group], (error) => {
					if (error != null) throw error;

					res.status(200);
					res.send({
						studentPosition: 0,
						studentsCount: studentsCount + 1
					});
					res.end();
					
				});			
			} 
			else 
			{
				if (password != student[0].password) {
					query = 'UPDATE students SET password = ? WHERE name = ?';
					connection.query(query, [password, name], (error) => {
						if (error != null) throw error;

						res.status(200);
						res.send({
							studentPosition: student[0].rating,
							studentsCount: studentsCount
						});
						res.end();					
					
					});	
				}
				else if (group != student[0].group_name) {
					query = 'UPDATE students SET group_name = ? WHERE name = ?';
					connection.query(query, [group, name], (error) => {
						if (error != null) throw error;

						res.status(200);
						res.send({
							studentPosition: student[0].rating,
							studentsCount: studentsCount
						});
						res.end();					
					
					});						
				}
				else {
					res.status(200);
					res.send({
						studentPosition: student[0].rating,
						studentsCount: studentsCount
					});
					res.end();	
				}
			}

			connection.end();
		});
	});
});

app.get("/rating/info", (req, res) => {
	
	connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	var query = 'SELECT fio, group_name, rating FROM students';
	connection.query(query, (error, students) => {
		if (error != null) throw error;

		// res.status(200);

		var string = '<table cellpadding="6">';

		if (req.query.sort != null) {

			students.sort((a, b) => {
				var keyA = a.rating,
				keyB = b.rating;
				
				if (req.query.sort == "up") {	
					if(keyA < keyB) return 1;
					if(keyA > keyB) return -1;
				}
				else if (req.query.sort == "down") {
					if(keyA < keyB) return -1;
					if(keyA > keyB) return 1;
				}
				return 0;
			});
		
		}

		students.forEach((student) => {
			string += "<tr>";
			string += ("<td>" + student.fio + "</td><td>" + student.group_name + "</td><td>" + student.rating + "</td>");
			string += "</tr>";
			if (student.fio == students[students.length - 1].fio) {
				res.send(string + "</table>");
				res.end();
			}
		});
	});

	connection.end();
});

function getStundetsInfo(students, index, end) {
	
	var temp = students.slice(index, index + 3);
	// console.log(temp);

	temp.forEach((student) => {
		getStudentStudyInfo(student, (results) => {
			updateRatingWeights(student, results);

			if (student.name == temp[temp.length - 1].name) {

				if (student.name == students[students.length - 1].name) {
					ratingWeights.sort((a, b) => {
						var keyA = a.midMark * a.midVisitsPercentage,
						keyB = b.midMark * b.midVisitsPercentage;
						
						if(keyA < keyB) return 1;
						if(keyA > keyB) return -1;
						return 0;
					});

					for (var i = 0; i < ratingWeights.length; i++) 

					{
						student = ratingWeights[i];
						// console.log(student);

						query = 'UPDATE students SET rating=? WHERE name=?';
						connection.query(query, [i + 1, student.name], (error, results) => {
							if (error != null) throw error;
							// else console.log(student.name + " updated");
						});
						if (i == ratingWeights.length - 1) {
							console.log("Rating updated");

							ratingWeights = [];
							params = null;

							connection.end()
							console.log("Close connection");
						}
					}
				} 
				else
					getStundetsInfo(students, index + 3);
			}
		}); 
	});
}

function updateRating() {

	connection = mysql.createConnection({
		host     : mysqlConfig.host,
		user     : mysqlConfig.user,
		password : mysqlConfig.password,
		database : mysqlConfig.db
	});	

	console.log("Open connection");

	var query = 'SELECT name, password FROM students';
	connection.query(query, (error, results) => {
		if (error != null) throw error;

		getStundetsInfo(results, 0);

		// students.forEach((student) => {
		// 	getStudentStudyInfo(student, (results) => {
		// 		updateRatingWeights(student, results);
		// 	}); 
		// });

				// studentsGetsCount++;

				// var marks = results.marks;
				// var visits = results.visits;

				// var lessonsWithMarksCount = 0;
				// marks.forEach((mark) => { if (mark != 0) lessonsWithMarksCount++ });

				// var totalMark = 0;
				// var totalVisits = 0;

				// marks.forEach((mark) => { totalMark += mark });
				// visits.forEach((visit) => { totalVisits += visit });

				// totalMark = Math.round((totalMark / lessonsWithMarksCount) * 100) / 100;
				// totalVisits = Math.round((totalVisits / visits.length) * 100) / 100;

				// ratingWeights.push({ name: student.name, midMark: totalMark, midVisitsPercentage: totalVisits });


				// if (studentIndex + 3 >= results.length) {

				// 	ratingWeights.sort((a, b) => {
				// 		var keyA = a.midMark * a.midVisitsPercentage,
				// 		keyB = b.midMark * b.midVisitsPercentage;
						
				// 		if(keyA < keyB) return 1;
				// 		if(keyA > keyB) return -1;
				// 		return 0;
				// 	});

				// 	for (var i = 0; i < ratingWeights.length; i++) 

				// 	{
				// 		student = ratingWeights[i];
				// 		// console.log(student);

				// 		query = 'UPDATE students SET rating=? WHERE name=?';
				// 		connection.query(query, [i + 1, student.name], (error, results) => {
				// 			if (error != null) throw error;
				// 			console.log(results);
				// 		});

				// 		if (i == ratingWeights.length - 1) connection.end();
				// 	}

				// }

		// 	});
		// });

	});

	// connection.end();

}

function getStudentStudyInfo(student, callback) {
	
	params = {
		name: student.name,
		password: student.password
	} 

	// console.log(params);

	requests.loginRequest(params, (results) => {

		var authCookie = results.cookie;
		var studentId  = results.student;

		console.log(studentId);

		params = {
			student: studentId,
			cookie: authCookie,
			year: "2020",
			month: "02",
		}

		requests.lessonsAndTeachersRequest(params, (results) => {

			// console.log(results);
			var lessons = results.lessons;

			// console.log(lessons.length);

			var i = 0;
			var midMarks = [];	
			var visitsPercentages = [];

			lessons.forEach((lesson) => {

				var params = {
					student: studentId,
					cookie: authCookie,
					lesson: lesson		
				}

				requests.exercisesByLessonRequest(params, (results) => {
					i++;

					var visits = results.visits;
					var was = results.was;
					var all = results.all;

					var midMark = 0;
					var counter = 0;

					for (var visit in visits) {
						var point = visits[visit][0].point;
						var performance = visits[visit][0].performance;

						if (point != null) {
							if (parseInt(point) > 1) {
								midMark += parseInt(point);
								counter++;
							}
						}
					}

					if (counter != 0) {
						midMark /= counter;
						// midMark =  Math.round(midMark * 1000) / 1000;
					}

					midMarks.push(midMark);
					visitsPercentages.push(was / all);
					if (i == lessons.length) callback({ marks: midMarks, visits: visitsPercentages });

				});

			});

		});

	});	

}

var startTime;
var timer; 

var port = process.env.PORT ? process.env.PORT : 80;

app.listen(port, () => {

	console.log("Server is running on " + port);
	
	startTime = (new Date()).getTime();
	timer = setInterval(() => {

		// console.log(1);

		var temp = (new Date()).getTime() - startTime;
		if (temp > 1000 * 60 * 30) {
			updateRating();
			startTime = (new Date()).getTime();
		}

	}, 1000 * 60);

	// updateRating();
});