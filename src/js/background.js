import OCR from '@js/OCR.js';

// detect browser
var br = /Firefox/.test(navigator.userAgent) ? browser : chrome;
console.log(br);
/**
 * Sending to page script a screenshot and data for crop this image with message "screenshot"
 * @param {number} x The x-axis coordinate
 * @param {number} y The y-axis coordinate
 * @param {number} width
 * @param {number} height
 */
async function sendImage(id, x, y, width, height, scale = 1) {
	br.tabs.captureVisibleTab((dataUrl) => {
		br.tabs.sendMessage(id, {
			message: "screenshot",
			data: {
				img: dataUrl,
				x: x,
				y: y,
				width: width,
				height: height,
				scale: scale
			}
		});
	});
}

br.runtime.onMessage.addListener(async (message, r) => {
	let tabId = r.tab.id;
	if (message.message == "pressOn") {
		console.log("on");
		br.tabs.sendMessage(tabId, { message: "start" });
	}
	else if (message.message == "pressOff") {
		console.log("off");
		br.tabs.sendMessage(tabId, { message: "end" });
	}
	else if (message.message == "image") {
		sendImage(tabId, message.data.x, message.data.y, message.data.width, message.data.height, 1);
	}
});
// OCR.js
let ocr = new OCR(br);
ocr.init("eng");
// ocr.init("rus");

br.runtime.onMessage.addListener(async (message, r) => {
	if (message.message == "ready" && ocr.job == false) {
		console.time("OCR");
		let t = await ocr.getConfidenceText(message.data, 80, 25, 40);
		console.log(t);
		console.log("=====================================");
		t = t.replace(/[^\p{L}\p{Zs}0-9,.'"`?!-=()*:;+-/\[\]\\]/gu, "");
		console.log(t);
		console.log("_________________________________");
		console.timeEnd("OCR");
	}
	else if (message.message == "error" || (message.message == "ready" && ocr.job == true)) {
		console.log("|-- !STOP! --|");
	}
});
/*
	значение по умолчанию:
	symbol: 80
	word: 25
	line: 60
	text: false

*/