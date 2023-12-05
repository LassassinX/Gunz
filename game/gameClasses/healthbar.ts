import { DrawableGameObject} from '../lib/smolGame/components'

export default class Healthbar extends DrawableGameObject{
	amountOfActiveBars: number
	amountOfBars: number
	width: number
	height: number
	barGap: number
	skewAngle: number
	inactiveColor: string

	constructor({ position, amount, width, height, barGap, skewAngle, color, inactiveColor, ctx }: {
		position: { x: number, y: number },
		amount: number,
		width: number,
		height: number,
		barGap: number,
		skewAngle: number,
		color: string,
		inactiveColor: string,
		ctx: CanvasRenderingContext2D
	}) {
		super({ position, color, ctx })
		this.ctx = ctx
		this.amountOfActiveBars = amount
		this.amountOfBars = amount
		this.width = width
		this.height = height
		this.barGap = barGap
		this.skewAngle = skewAngle
		this.color = color
		this.inactiveColor = inactiveColor
	}

	decrement() {
		this.amountOfActiveBars -= 1

		if (this.amountOfActiveBars <= 0) {
			this.amountOfActiveBars = 0
		}
	}

	draw() {
		let diff = this.amountOfBars - this.amountOfActiveBars
		for (let i = 0; i < this.amountOfBars; i++) {
			this.ctx.save()
			if (diff > 0) {
				this.ctx.fillStyle = this.inactiveColor
				this.ctx.globalAlpha = 0.2
				this.ctx.translate(0, 10)
				diff--
			} else {
				this.ctx.fillStyle = this.color
			}

			this.ctx.setTransform(1, 0, Math.tan(this.skewAngle), 1, 0, 0)
			this.ctx.beginPath()
			this.ctx.rect(this.position.x + (this.width + this.barGap) * i, this.position.y, this.width, this.height)
			this.ctx.fill()
			this.ctx.closePath()
			this.ctx.restore()
		}
	}

	update() {
		this.draw()
	}
}

