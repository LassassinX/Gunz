export default class FrameCounter {
	frames: number
	date: Date
	constructor() {
		this.frames = 0
		this.date = new Date()
	}

	incrementFrame() {
		this.frames++
		this.frames = this.frames % 60
	}

	getFrames() {
		return this.frames
	}

	at(milliseconds: number, callBack: Function) {
		const now = new Date()
		// @ts-ignore
		const difference = now - this.date
		if (difference >= milliseconds) {
			callBack()
			this.date = new Date()
		}
	}
}
