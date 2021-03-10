class mousePosition {
	startPoint = [];
	endPoint = [];
	name;

	constructor(name) {
		this.name = name;
	}

	eventGo() {
		document.body.style.pointerEvents = "none";
		document.body.style.userSelect = "none";

		this.startPoint = [];
		this.endPoint = [];

		document.addEventListener("mousedown", this.start);
		document.addEventListener("mouseup", this.end);
	}
	eventEnd() {
		document.body.style.pointerEvents = "auto";
		document.body.style.userSelect = "text";

		document.removeEventListener("mousedown", this.start);
		document.removeEventListener("mouseup", this.end);
	}
	// recording the coordinate of start point
	start = (event) => {
		let scale = window.devicePixelRatio;
		this.startPoint = [event.clientX * scale, event.clientY * scale];
	}
	// recording the coordinate of end point and run event
	end = (event) => {
		this.eventEnd();
		if (this.startPoint.length == 2) {
			let scale = window.devicePixelRatio;
			this.endPoint = [event.clientX * scale, event.clientY * scale];

			// run event
			document.dispatchEvent(new CustomEvent("coordinate", {
				bubbles: true, detail: {
					name: this.name,
					points: {
						start: this.startPoint,
						end: this.endPoint
					}
				}
			}))
		}
	}
}

export default mousePosition;