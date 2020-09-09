const axios = require("axios");


async function login(name, password)
{
	let params = new URLSearchParams();
	params.append("User[login]", name);
	params.append("User[password]", password);

	let axiosConfig = {
		maxRedirects: 0,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.95",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
		}
	};

	try { await axios.post("https://ifspo.ifmo.ru", params, axiosConfig); } 
	catch (err) 
	{ 
		let cookiesCount = err.response.headers["set-cookie"].length;

		let authCookie = err.response.headers["set-cookie"][cookiesCount - 1]; 
		
		let studentID = decodeURIComponent(authCookie).split("s:");
		studentID = studentID[studentID.length - 4].split(":")[1];
		studentID = studentID.slice(1, studentID.length - 2);

		return { authCookie, studentID };
	}
}

async function getLessonsAndTeachers(studentID, year, month, authCookie)
{
	let axiosConfig = {
		maxRedirects: 0,
		withCredentials: true,
		headers: {
			Cookie: authCookie,
			"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.95"
		}
	};

	let url = "https://ifspo.ifmo.ru/profile/getStudentLessonsVisits" 
		+ "?stud=" + studentID
		+ "&dateyear=" + year
		+ "&datemonth=" + month

	let response = await axios.get(url, axiosConfig)

	return {
		lessons:   response.data.userlessons,
		exercises: response.data.Exercises,
		visits:    response.data.ExercisesVisits, 
		teachers:  response.data.lessonteachers
	}	
}

async function getExercisesByLesson(studentID, lessonID, authCookie)
{
	const axiosConfig = {
		maxRedirects: 0,
		withCredentials: true,
		headers: {
			Cookie: authCookie,
			"User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.95"
		}
	};

	let url = "https://ifspo.ifmo.ru/journal/getStudentExercisesByLesson" 
		+ "?lesson=" + lessonID
		+ "&student=" + studentID

	let response = await axios.get(url, axiosConfig);
	
	return {
		exercises:  response.data.Exercises,
		visits:     response.data.todayExercisesVisits,
		teacher:    response.data.teacher,
		was:        response.data.was,
		all:        response.data.all,
		// perfomance: response.data.perfomance
	}	
}

exports.login = login;
exports.getLessonsAndTeachers = getLessonsAndTeachers;
exports.getExercisesByLesson = getExercisesByLesson;
