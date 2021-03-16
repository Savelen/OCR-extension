import OCR from '@js/OCR.js';

/**
 * Sending to page script a screenshot and data for crop this image with message "screenshot"
 * @param {number} x The x-axis coordinate
 * @param {number} y The y-axis coordinate
 * @param {number} width
 * @param {number} height
 * @param {number} scale image scale
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
async function setHistory({ text, fullText = "" }) {
	if (text || fullText) {
		// new data for history
		let data = { date: Date.now(), text: text }
		let history = JSON.parse(localStorage.getItem('history'));
		if (!Array.isArray(history)) history = [];

		if (fullText && fullText !== text) data.fullText = fullText;
		else if (fullText === text) data.fullText = true;

		if (history.length >= 10) history.shift();
		history.push(data);
		localStorage.setItem("history", JSON.stringify(history));
	}
}
async function inBuffer(text) {
	const el = document.createElement('textarea');
	el.value = text;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
}
/**
 *
 * @param {boolean} successful
 */
async function soundAlert(successful) {
	let audio = new Audio("audio/" + (successful ? "successful.ogg" : "fail.ogg"));
	audio.play();
}
// getting setting data (from popup)
function getSettingData() {
	let setting = JSON.parse(localStorage.getItem('data'));
	if (!setting) {
		setting = {
			recognize: {
				lang: "eng",
				scale: 1,
				confidenceSymbol: 80,
				confidenceWord: 25,
				confidenceLine: 60,
				confidenceText: 0,
			},
			control: {
				key: ['Control', 'Alt'],
				button: false,
			},
			result: {
				validation: true,
				inBuffer: false,
				soundSignal: false,
				history: false,
				historyFullText: false,
			},
		};
	}
	return setting;
}
function getHistoryData() {
	let history = JSON.parse(localStorage.getItem('history'));
	if (!history) history = [];
	return history;
}
function pushSettingControl(id, settingData) {
	if (id !== -1) {
		br.tabs.sendMessage(id, {
			message: "settingControl",
			data: settingData.control
		});
	}
}

// detect browser
let br = /Firefox/.test(navigator.userAgent) ? browser : chrome;

let tabId = -1;
br.runtime.onMessage.addListener(async (message, r) => {
	tabId = r.hasOwnProperty('tab') ? r.tab.id : tabId;
	let settingData = getSettingData();

	// Actions
	if (message.message === "getSettingData") {
		br.runtime.sendMessage({
			message: "settingData",
			data: settingData
		});
	}
	else if (message.message === "getHistoryData") {
		br.runtime.sendMessage({
			message: "historyData",
			data: getHistoryData()
		});
	}
	else if (message.message === "getControlData") {
		pushSettingControl(tabId, settingData);
	}
	else if (message.message === "clearHistory") {
		localStorage.removeItem('history');
	}
	// saving new setting data
	else if (message.message === "setSettingData") {
		localStorage.setItem("data", JSON.stringify(message.data));
		pushSettingControl(tabId, getSettingData());
	}
	else if (message.message === "pressOn") {
		console.log("on");
		br.tabs.sendMessage(tabId, { message: "start" });
	}
	else if (message.message === "pressOff") {
		console.log("off");
		br.tabs.sendMessage(tabId, { message: "end" });
	}
	else if (message.message === "image") {
		sendImage(
			tabId,
			message.data.x,
			message.data.y,
			message.data.width,
			message.data.height,
			settingData.recognize.scale
		);
	}
	else if (message.message == "ready" && ocr.job == false) {
		console.time("OCR");
		// recognize
		let t = await ocr.getConfidenceText(
			message.data,
			settingData.recognize.confidenceSymbol,
			settingData.recognize.confidenceWord,
			settingData.recognize.confidenceLine,
			settingData.recognize.confidenceText
		);

		let textData = {};
		if (settingData.result.validation) {
			// save fulltext
			if (settingData.result.historyFullText) {
				textData.fullText = t;
			}
			// validation
			t = t.replace(/[^\p{L}\p{Zs}0-9,.'"`?!-=()*:;+-/\[\]\\]/gu, "");
		}
		// result text
		textData.text = t;

		if (settingData.result.inBuffer) inBuffer(textData.text);
		if (settingData.result.soundSignal) soundAlert(true);
		if (settingData.result.history) setHistory(textData);

		console.log(t);
		console.log("_________________________________");
		console.timeEnd("OCR");
	}
	else if (message.message == "error" || (message.message == "ready" && ocr.job == true)) {
		if (settingData.result.soundSignal) soundAlert(false);
		console.log("|-- !STOP! --|");
	}
});
br.tabs.onActivated.addListener((tab) => pushSettingControl(tab.tabId, getSettingData()));

// OCR.js
let ocr = new OCR(br);
ocr.init(getSettingData().recognize.lang);