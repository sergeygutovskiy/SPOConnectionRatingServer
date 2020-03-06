var axios = require("axios");

exports.loginRequest = function (name, password, callback) {
	const params = new URLSearchParams();
	params.append("User[login]", name);
	params.append("User[password]", password);

	const axiosConfig = {
		maxRedirects: 0,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.95",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"Content-Length": params.legth
		}
	};

	axios.post("https://ifspo.ifmo.ru", params, axiosConfig)
	.catch((err) => {
		let cookiesCount = err.response.headers["set-cookie"].length;
		let authCookie = err.response.headers["set-cookie"][cookiesCount - 1];
		let splitCookie = decodeURIComponent(authCookie).split("s:");
		
		let student = splitCookie[splitCookie.length - 5].split(":")[1];
		student = student.slice(1, student.length - 2);

		callback(authCookie, student);
	})
}

exports.lessonsAndTeachersRequest = function (student, year, month, cookie, callback) {
	
	const axiosConfig = {
		maxRedirects: 0,
		withCredentials: true,
		headers: {
			Cookie: cookie,
			"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.95"
		}
	};

	let address = "https://ifspo.ifmo.ru/profile/getStudentLessonsVisits" 
		+ "?stud=" + student
		+ "&dateyear=" + year
		+ "&datemonth=" + month

	axios.get(address, axiosConfig)
	.then((res) => {
		let data = res.data;
		// console.log(data);
		callback(data.userlessons, data.Exercises, data.ExercisesVisits, data.lessonteachers);
	})
	.catch((err) => {
		console.log(err);
	});
}

exports.exercisesByLessonRequest = function (student, lesson, cookie, callback) {
	const axiosConfig = {
		maxRedirects: 0,
		withCredentials: true,
		headers: {
			Cookie: cookie,
			"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.95"
		}
	};

	let address = "https://ifspo.ifmo.ru/journal/getStudentExercisesByLesson" 
		+ "?lesson=" + lesson
		+ "&student=" + student

	axios.get(address, axiosConfig)
	.then((res) => {
		let data = res.data;
		// console.log(data);
		callback(data.Exercises, data.todayExercisesVisits, data.teacher, data.all, data.was);
	})
	.catch((err) => {
		console.log(err);
	});
}