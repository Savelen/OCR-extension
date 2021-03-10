class CutImg {
	canvas;
	img;
	progress = 0;

	constructor() {
		this.canvas = document.createElement("canvas");
	}
	/**
	 * Cut out selected area in image
	 * @param {string} url Img source
	 * @param {number} x The x-axis coordinate
	 * @param {number} y The y-axis coordinate
	 * @param {number} width
	 * @param {number} height
	 */
	async cut(url, x, y, width, height, scale) {
		let img = new Image();
		img.src = url;


		let canW = width * scale;
		let canH = height * scale;

		this.canvas.width = canW;
		this.canvas.height = canH;
		let ctx = this.canvas.getContext('2d');

		// getting url of image when image will be loaded
		img.addEventListener("load", () => {
			ctx.drawImage(img, x, y, width, height, 0, 0, canW, canH);
			this.img = this.canvas.toDataURL();
			this.progress = 1;
		});
		// In case of error
		img.addEventListener("error", () => this.progress = -1);
		img.addEventListener("abort", () => this.progress = -1);
		// Waiting get url
		let prom = new Promise((resolve, reject) => {
			let id = setInterval(() => {
				if (this.progress == 1) {
					this.progress = 0;
					resolve(this.img);
					clearInterval(id);
				}
				else if (this.progress == -1) {
					resolve(false);
				}
			}, 2);
		});
		return prom;
	}
}

export default CutImg;