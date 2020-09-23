const fastify  = require("fastify", { logger: true });
const axios    = require("axios");
const mysql    = require("mysql");
const util     = require('util');

const requests = require("./newrequests.js"); 


/* TO DO
 *
 * 1. Rename "round" variable to "cycle"
 *
 *
 *
 *
 *
 */


const app = fastify();

app.get("/api", (req, res) => {
	if (req.query.method == "rating.student")
	{
		return checkRatingStudent(
			req.query.studentID, 
			req.query.name, 
			req.query.password, 
			req.query.fio, 
			req.query.party);
	}
	else if (req.query.method == "rating.update")
	{
		updateRating();
		return 0;
	}

})

app.listen(3000 || process.env.PORT, '0.0.0.0').then(() => {
	console.log("Server is running...");
});

const DBConfig = {
 	host: "us-cdbr-iron-east-04.cleardb.net",
 	user: "bfab93c67f2afe",
 	password: "435d995d",
 	database: "heroku_78b065a4fdc5343"
	
	// host: "127.0.0.1",
	// user: "root",
	// password: "root",
	// database: "fspoapp_server"
}


async function checkRatingStudent(studentID, name, password, fio, party)
{
	let connection = mysql.createConnection(DBConfig);	
	let query = util.promisify(connection.query).bind(connection);

	let queryString = "SELECT (student_id) FROM students";
	let IDs = await query(queryString);
	let studentsCount = IDs.length;

	queryString = "SELECT * FROM students WHERE student_id=?";
	let student = await query(queryString, [ studentID ]);

	// new student
	if (student.length == 0)
	{
		queryString = "INSERT INTO students (student_id, name, password, fio, party) VALUES (?, ?, ?, ?, ?)";
		await query(queryString, [ studentID, name, password, fio, party ]);
	
		connection.end();
		return { pos: -1, count: studentsCount + 1}; 
	}
	else
	{
		// new password
		if (
			student[0].name != name
			|| student[0].password != password
			|| student[0].fio != fio
			|| student[0].party != party
		)
		{
			queryString = "UPDATE students SET name=?, password=?, fio=?, party=? WHERE student_id = ?";
			await query(queryString, [ name, password, fio, party, studentID ]);		
		}
		
		connection.end();
		return { pos: student[0].rating_place, count: studentsCount };
	}
}

async function updateRating()
{
	let connection = mysql.createConnection(DBConfig);	
	let query = util.promisify(connection.query).bind(connection);

	let queryString = "SELECT MAX(round) from students_info";
	let ratingUpdatingRound = await query(queryString);

	let round = ratingUpdatingRound[0]["MAX(round)"];
	if (round == null) round = 0;
	else round = Number(round) + 1;

	queryString = "SELECT * FROM students";
	let students = await query(queryString);

	// get students's mid marks for each lesson
	for (student of students)
	{
		let response = await requests.login(student.name, student.password);
		let authCookie = response.authCookie;
		let studentID = response.studentID;

		let date  = new Date();
		let month = new Intl.DateTimeFormat("en", { day:  "2-digit" }).format(date);
		let year  = new Intl.DateTimeFormat('en', { year: "numeric" }).format(date);

		response = await requests.getLessonsAndTeachers(studentID, year, month, authCookie);
		let lessons = response.lessons;

		for (lesson of lessons)
		{
			response = await requests.getExercisesByLesson(studentID, lesson.id, authCookie);
			// console.log(lesson.name + ": " + response.was / response.all);
			let visits = response.visits;

			let marksSum = marksCount = 0;
			for (key in visits)
			{
				let visit = visits[key][0];
				
				if (visit.point == null) continue;
				
				marksSum += Number(visit.point);
				marksCount++;

			}

			let midMark = (marksCount == 0)? 0 : marksSum / marksCount;
		
			queryString = "INSERT INTO students_info (student_id, lesson_id, mid_mark, mid_visits, round) VALUES(?, ?, ?, ?, ?)";
			await query(queryString, [ studentID, lesson.id, midMark, response.was / response.all , round ]);
		}
	}

	let averageMarks = [];
	
	// fill array with sum of mid marks for each student
	for (student of students)
	{
		queryString = "SELECT SUM(mid_mark) FROM students_info WHERE round = ? AND student_id = ?";
		response = await query(queryString, [ round, student.student_id ]);
		let sum_marks = response[0]["SUM(mid_mark)"];
	
		queryString = "SELECT SUM(mid_visits) FROM students_info WHERE round = ? AND student_id = ?";
		response = await query(queryString, [ round, student.student_id ]);
		let sum_visits = response[0]["SUM(mid_visits)"];
	
		console.log(sum_marks, sum_visits);

		averageMarks.push({
			studentID: student.student_id,
			averangeMark: sum_marks,
			averangeVisit: sum_visits
		});
	}
	
	// sort students by their average marks
	averageMarks.sort((a, b) => {
		if      ((a.averangeMark - b.averangeMark) < 0) return 1;
		else if ((a.averangeMark - b.averangeMark) > 0) return 0;
		else    										return b.averangeVisit - a.averangeVisit;
	});

	// update rating in DB
	for (position in averageMarks)
	{
		queryString = "UPDATE students SET rating_place = ? WHERE student_id = ?";
		await query(queryString, [ Number(position) + 1, averageMarks[position].studentID ]);
	}
	
	connection.end();	

	return 0;
}

async function main()
{

	let authCookie = studentID = null;

	let response = await requests.login("iskhakovgermantimurovich", "passwordToChange");
	authCookie   = response.authCookie;
	studentID    = response.studentID; 

	//

	let lessons = exercises = visits = teachers = null;

	response  = await requests.getLessonsAndTeachers(studentID, "2020", "09", authCookie);
	lessons   = response.lessons;
	exercises = response.exercises;
	visits    = response.visits;
	teachers  = response.teachers;

	//

	let lessonExercises = null;

	lessonExercises = await requests.getExercisesByLesson(studentID, lessons[0].id, authCookie);
}
