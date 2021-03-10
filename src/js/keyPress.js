/**
 * Keypress tracking with "changeKeyPress" event triggering
 */
class keyPress {
	name;
	keyPress = false;
	keyCode = ['Control'];
	keyPressed = {};

	/**
	 * @param {array} keyCode list code. Defaylt 'Control'
	 */
	constructor(name, keyCode = false) {
		this.name = name;
		this.keyCode = keyCode || this.keyCode;
	}
	/**
	 * Keypress tracking
	 */
	tracking() {
		document.addEventListener("keydown", key => {
			// Checking a new key for uniqueness
			let eventGo;
			if (this.keyPressed.hasOwnProperty(key.key)) eventGo = false;
			else eventGo = true;

			this.keyPressed[key.key] = true;
			if (eventGo) this.check();
		});
		document.addEventListener("keyup", key => {
			delete this.keyPressed[key.key];
			this.check();
		});
		document.addEventListener("click", () => {
			this.keyPressed = {};
		})

	}

	check() {
		let complete = false;
		// Key matching
		if (this.keyCode.length == Object.keys(this.keyPressed).length) {
			for (const key in this.keyPressed) {
				if (this.keyPressed.hasOwnProperty(key)) {
					if (this.keyCode.indexOf(key) == -1) complete = false;
					else complete = true;
				}
			}
		} else complete = false;

		// Run event
		if (complete) {
			this.keyPress = true;
			document.dispatchEvent(this.event());
		}
		else {
			this.keyPress = false;
			document.dispatchEvent(this.event());
		}
	}
	event() {
		return new CustomEvent("changeKeyPress", { bubbles: true, detail: { name: this.name, keyPress: this.keyPress } });
	}
}

export default keyPress;