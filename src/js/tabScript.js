import CutImg from '@js/captureScreen.js';
import mousePosition from '@js/mousePosition.js';
import keyPress from "@js/keyPress.js";

// detect browser
let br = /Firefox/.test(navigator.userAgent) ? browser : chrome;


// keyPress.js
let settingControl = {}
let keyEvent = {};
br.runtime.onMessage.addListener(async message => {
	if (message.message === "settingControl") {
		settingControl = message.data;
		if (keyEvent.hasOwnProperty('name')) { keyEvent.deleteTracking(); }
		keyEvent = new keyPress("Run", { key: settingControl.key });
		keyEvent.tracking();
	}
});
br.runtime.sendMessage({ message: "getControlData" });

document.addEventListener("changeKeyPress", (event) => {
	if (event.detail.name == "Run") {
		if (event.detail.keyPress) br.runtime.sendMessage({ message: "pressOn" });
		else br.runtime.sendMessage({ message: "pressOff" });
	}
});

// CutImg.js
let handler = new CutImg();

br.runtime.onMessage.addListener(async message => {
	if (message.message == "screenshot") {
		let data = message.data;

		// getting url of image
		let img = await handler.cut(data.img, data.x, data.y, data.width, data.height, data.scale);
		if (img !== false) {
			br.runtime.sendMessage({
				message: "ready",
				data: img
			});
		}
		else {
			br.runtime.sendMessage({
				message: "error"
			});
		}
	}
});

// mousePosition.js

let position = new mousePosition("selectArea");

br.runtime.onMessage.addListener((message) => {
	if (message.message == "start") position.eventGo();
	else if (message.message == "end") position.eventEnd();
});

document.addEventListener("coordinate", (event) => {
	if (event.detail.name == "selectArea") {
		let points = event.detail.points;

		points.width = Math.abs(Math.floor(points.start[0] - points.end[0]));
		points.height = Math.abs(Math.floor(points.start[1] - points.end[1]));

		br.runtime.sendMessage({
			message: "image",
			data: {
				x: ((points.start[0] < points.end[0]) ? points.start[0] : (points.start[0] - points.width)),
				y: ((points.start[1] < points.end[1]) ? points.start[1] : (points.start[1] - points.height)),
				width: points.width,
				height: points.height
			}
		});
	}
});