import OCR from '@js/OCR.js';

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

// detect browser
let br = /Firefox/.test(navigator.userAgent) ? browser : chrome;
// getting setting data (from popup)

let getSettingData = () => {
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
let pushSettingControl = (id, settingData) => {
	if (id !== -1) {
		br.tabs.sendMessage(id, {
			message: "settingControl",
			data: settingData.control
		});
	}
}

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
	else if (message.message === "getControlData") {
		pushSettingControl(tabId, settingData);
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
		let t = await ocr.getConfidenceText(
			message.data,
			settingData.recognize.confidenceSymbol,
			settingData.recognize.confidenceWord,
			settingData.recognize.confidenceLine,
			settingData.recognize.confidenceText
		);
		if (settingData.result.validation) {
			t = t.replace(/[^\p{L}\p{Zs}0-9,.'"`?!-=()*:;+-/\[\]\\]/gu, "");
		}
		console.log(t);
		console.log("_________________________________");
		console.timeEnd("OCR");
	}
	else if (message.message == "error" || (message.message == "ready" && ocr.job == true)) {
		console.log("|-- !STOP! --|");
	}
});
br.tabs.onActivated.addListener((tab) => pushSettingControl(tab.tabId, getSettingData()));

// OCR.js
let ocr = new OCR(br);
ocr.init(getSettingData().recognize.lang);