var express = require("express");
const http = require("http");
const fs = require("fs");
var FormData = require("form-data");

var requests = require("./requests");

const app = express();


app.use(express.urlencoded({ extended: true }));



app.get("/api/rating/get", (req, res) => {

	requests.loginRequest("gutovskijsergejaleksandrovich", "pbaah8kc", (cookie, student) => {

		requests.lessonsAndTeachersRequest(student, "2020", "02", cookie, (lessons, exercises, visits, teachers) => {
			
			lessonMidMark = 0;

			lessons.forEach((lesson) => {

				var midMark = 0;
				var counter = 0;
				requests.exercisesByLessonRequest(student, lesson.id, cookie, (exercises, visits, teacher, all, was) => {

					for (var visit in visits) {
						point = visits[visit][0].point;
						if (point != null) {
							if (parseInt(point) > 1) {
								midMark += parseInt(point);
								counter++;
							}
						}
					}

					if (counter != 0)
						midMark /= counter;
					if (midMark == 0) midMark = 5;
					lessonMidMark += midMark;
					console.log(lesson.name + " mark: " + midMark + " visits: " + was + "/" + all);
					console.log("LessonsMidMark: " + lessonMidMark / lessons.length);
				});
			});
		});

		// requests.exercisesByLessonRequest(student, "30", cookie, (a, b, c, d, e) => {
			// console.log(a, b, c, d, e);
		// });



	});

	res.end();
});


app.listen(80, () => {
	console.log("Server is running on 80!");
	// requests.loginRequest("gutovskijsergejaleksandrovich", "pbaah8kc", (cookie, student) => {
	// 	// console.log(cookie, student);

	// 	// requests.lessonsAndTeachersRequest(student, "2020", "02", cookie, (a, b, c, d) => {
	// 	// 	// console.log(a, b, c, d);			
	// 	// });

	// 	// requests.exercisesByLessonRequest(student, "30", cookie, (a, b, c, d, e) => {
	// 		// console.log(a, b, c, d, e);
	// 	// });



	// });
});