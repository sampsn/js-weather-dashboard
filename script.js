"use strict";
const sidebarBtn = document.getElementById("sidebar-btn");
const body = document.getElementById("main-body");
const navbar = document.getElementById("navbar");
const sidebar = document.getElementById("sidebar");

sidebarBtn.addEventListener("click", () => {
	if (!sidebar.classList.contains("collapsed")) {
		sidebar.classList.add("collapsed");
		sidebar.classList.toggle("col-span-1");
		sidebar.classList.toggle("h-screen");
		sidebar.classList.toggle("row-start-3");
		body.classList.replace("col-start-2", "col-start-1");
		navbar.classList.replace("col-start-2", "col-start-1");
	} else {
		sidebar.classList.remove("collapsed");
		sidebar.classList.toggle("col-span-1");
		sidebar.classList.toggle("h-screen");
		sidebar.classList.toggle("row-start-3");
		body.classList.replace("col-start-1", "col-start-2");
		navbar.classList.replace("col-start-1", "col-start-2");
	}
});

const signinBtn = document.getElementById("signin-btn");
const signinModal = document.getElementById("sign-in-modal");

signinBtn.addEventListener("click", () => {
	console.log("Sign in button clicked!");
	signinModal.showModal();
});

const getForecast = async (json) => {
	const stgForecastUrl = await json.properties.forecast;

	const stgForecastResp = await fetch(stgForecastUrl);

	const stgWeather = await stgForecastResp.json();

	return stgWeather;
};

const getHourlyForecast = async (json) => {
	const stgForecastUrl = await json.properties.forecastHourly;

	const stgForecastResp = await fetch(stgForecastUrl);

	const stgWeather = await stgForecastResp.json();

	return stgWeather;
};

const getHighLow = async (weather) => {
	const firstPeriod = await weather.properties.periods[0].temperature;

	const secondPeriod = await weather.properties.periods[1].temperature;

	let highDescription = "";
	let lowDescription = "";

	let stgCurrentHigh = 0;
	let stgCurrentLow = 0;

	if (firstPeriod > secondPeriod) {
		stgCurrentHigh = firstPeriod;
		highDescription = weather.properties.periods[0].detailedForecast;
		stgCurrentLow = secondPeriod;
		lowDescription = weather.properties.periods[1].detailedForecast;
	} else {
		stgCurrentHigh = secondPeriod;
		highDescription = weather.properties.periods[1].detailedForecast;
		stgCurrentLow = firstPeriod;
		lowDescription = weather.properties.periods[0].detailedForecast;
	}

	document.getElementById("todays-high").textContent = stgCurrentHigh;
	document.getElementById("todays-low").textContent = stgCurrentLow;
	document.getElementById("highDescription").textContent = highDescription;
	document.getElementById("lowDescription").textContent = lowDescription;
};

const getWeeklyForecast = async (weather) => {
	const weeklyDiv = document.getElementById("weekly");
	const periods = await weather.properties.periods;
	console.log(periods);
	for (let i = 2; i < periods.length; i++) {
		if (periods[i].isDaytime) {
			const newDiv = document.createElement("div");
			newDiv.classList =
				"flex flex-row justify-between items-center border-b border-stone-700";

			const title = document.createElement("p");
			title.classList = "font-bold text-2xl p-1";
			title.textContent = periods[i].name;

			const weatherDiv = document.createElement("div");
			weatherDiv.id = periods[i].name;
			weatherDiv.classList = "flex flex-row w-18 items-between";

			const forecastHigh = document.createElement("p");
			forecastHigh.classList = "font-bold text-2xl text-orange-500";
			forecastHigh.textContent = periods[i].temperature;
			newDiv.appendChild(title);
			newDiv.appendChild(weatherDiv);
			weatherDiv.appendChild(forecastHigh);
			weeklyDiv.appendChild(newDiv);
		} else {
			const forecastLow = document.createElement("p");
			forecastLow.classList = "font-bold text-md m-2 text-blue-400";
			forecastLow.textContent = periods[i].temperature;

			document.getElementById(periods[i - 1].name).appendChild(forecastLow);
		}
	}
};

const makeChart = async (weather) => {
	console.log(weather);
	const periods = weather.properties.periods;

	const hourTemps = [];
	for (let i = 0; i < 24; i++) {
		hourTemps.push(periods[i].temperature);
	}

	const timeSlots = [];
	for (let i = 0; i < 24; i++) {
		let time = new Date(periods[i].startTime).toLocaleTimeString();

		timeSlots.push(time.replace(":00:00", ""));
	}

	const ctx = document.getElementById("hourlyChart").getContext("2d");
	const hourlyChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: timeSlots,
			datasets: [
				{
					label: "Hourly Temperature",
					data: hourTemps,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
};

const makeWeeklyChart = async (weather) => {
	console.log(weather);
	const periods = weather.properties.periods;

	const dayTemps = [];
	for (let i in periods) {
		dayTemps.push(periods[i].temperature);
	}

	const timeSlots = [];
	for (let i = 0; i < 7; i++) {
		let date = new Date(periods[i].startTime).toString();
		timeSlots.push(date.slice(0, 3));
	}

	const ctx = document.getElementById("weeklyChart").getContext("2d");
	const weeklyChart = new Chart(ctx, {
		type: "bar",
		data: {
			labels: timeSlots,
			datasets: [
				{
					label: "Weekday Temperature",
					data: dayTemps,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
};

const getWindData = async (weather) => {
	const windSpeed = document.getElementById("windSpeed");
	const windDirection = document.getElementById("windDirection");

	windSpeed.textContent = weather.properties.periods[0].windSpeed;
	windDirection.textContent = weather.properties.periods[0].windDirection;
};

document.addEventListener("DOMContentLoaded", async () => {
	const stgPoints = "37.09,-113.55";

	const baseUrl = "https://api.weather.gov";

	const stgWeatherUrl = `${baseUrl}/points/${stgPoints}`;

	const stgInfoResp = await fetch(stgWeatherUrl);
	const stgInfoJson = await stgInfoResp.json();

	const stgWeatherInfo = await getForecast(stgInfoJson);
	const stgHourly = await getHourlyForecast(stgInfoJson);

	getHighLow(stgWeatherInfo);

	getWeeklyForecast(stgWeatherInfo);

	makeChart(stgHourly);

	makeWeeklyChart(stgWeatherInfo);

	getWindData(stgWeatherInfo);
});
