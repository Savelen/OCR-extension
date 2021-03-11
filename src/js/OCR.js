import Tesseract from 'tesseract.js';
class OCR {
	worker;
	job = false;
	constructor(br) {
		const { createWorker } = Tesseract;
		this.worker = createWorker({
			workerPath: br.runtime.getURL('js/tesseract/worker.min.js'),
			// langPath: br.runtime.getURL('js/tesseract/traineddata/'),
			corePath: br.runtime.getURL('js/tesseract/tesseract-core.wasm.js'),
			logger: m => console.log(m)
		});
	}

	async init(lang) {
		const { PSM, OEM } = Tesseract;
		await this.worker.load();
		await this.worker.loadLanguage(lang);
		await this.worker.initialize(lang);
		await this.worker.setParameters({
			tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
			tessedit_pageseg_mode: PSM.PSM_SPARSE_TEXT_OSD,
			tessjs_create_hocr: '0',
			tessjs_create_tsv: '0'
		});
	}

	async setLang(lang) {
		await this.worker.loadLanguage(lang);
		await this.worker.initialize(lang);
	}

	async recognize(url) {
		this.job = true;
		let recognize = await this.worker.recognize(url);
		console.log(recognize);
		this.job = false;
		return recognize;

	}

	getFullText(recognize) {
		this.job = true;
		if (typeof recognize == 'object') {
			return recognize.then(({ data: { text } }) => {
				this.job = false;
				return text;
			});
		}
		else if (typeof recognize == "string") {
			// get promise and call recursion
			return this.getFullText(this.recognize(recognize));
		}
	}
	/**
	 * return recognize text using specific parametrs
	 * @param {number} confidenceSymbol from 0 to 100
	 * @param {string | object} recognize url img or object with result of recognize
	 * @param {number} confidenceWord from 0 to 100
	 * @param {number} confidenceLine from 0 to 100
	 * @param {number} confidenceText from 0 to 100
	 */
	async getConfidenceText(recognize, confidenceSymbol, confidenceWord = false, confidenceLine = false, confidenceText = false) {
		if (typeof recognize == 'object') {
			let worldArr = [];
			if (recognize.data.confidence >= confidenceText || confidenceText == false) {
				for (const line of recognize.data.lines) {
					if (line.confidence >= confidenceLine || confidenceLine == false) {
						for (const word of line.words) {
							if (word.confidence >= confidenceWord || confidenceWord == false) {
								let symbols = word.symbols.map(symbol => {
									if (symbol.confidence >= confidenceSymbol) {
										return symbol.text.replace(/[/|\\]/, "i");
									}
								});
								worldArr.push(symbols.join(''));
							}
						}
					}
				}
			}
			return worldArr.join(' ');
		}
		else if (typeof recognize == "string") {
			// get promise and call recursion
			return this.getConfidenceText(await this.recognize(recognize), confidenceSymbol, confidenceWord, confidenceLine, confidenceText);
		} else if (recognize === false) return false;
	}

	textFilter(text) {

	}
}

export default OCR;