import anime from 'animejs'
import { DrawableGameObject } from '../lib/smolGame/components'

export default class Grid {
	ctx: CanvasRenderingContext2D
	gapX: number
	gapY: number
	particleW: number
	particleH: number
	color: string
	particles: GridParticle[] = []

	rows: GridParticle[][]
	columns: GridParticle[][]

	rowCount: number = 0
	columnCount: number = 0

	gridPaddingX: number
	gridPaddingY: number

	isFlashing: boolean = false

	constructor({
		ctx,
		gapX,
		gapY,
		particleW,
		particleH,
		color,
	}: {
		ctx: CanvasRenderingContext2D,
		gapX: number,
		gapY: number,
		particleW: number,
		particleH: number,
		color: string,
	}) {
		this.ctx = ctx
		this.gapX = gapX
		this.gapY = gapY
		this.particleW = particleW
		this.particleH = particleH
		this.color = color

		this.rows = []
		this.columns = []

		this.gridPaddingX = gapX / 2
		this.gridPaddingY = gapY / 2

		this.createGrid()
	}

	createGrid() {
		for (let i = this.gridPaddingY; i < this.ctx.canvas.height; i += this.gapY) {
			// const row = []
			this.columnCount = 0
			for (let j = this.gridPaddingX; j < this.ctx.canvas.width; j += this.gapX) {
				const particle = new GridParticle({
					position: { x: j, y: i },
					width: this.particleW,
					height: this.particleH,
					color: this.color,
					ctx: this.ctx
				})
				// row.push(particle)
				this.particles.push(particle)
				this.columnCount++
			}
			// this.rows.push(row)
			this.rowCount++
		}

		// this.columns = this.rows[0].map((_, columnIndex) =>
			// this.rows.map((row) => row[columnIndex])
		// );
	}

	flash(color: string, changeColor: boolean = false) {
		this.isFlashing = true
		let oldColor = this.particles[0].color

		setTimeout(() => {
			this.isFlashing = false
		}, 150)

		this.particles.forEach((gridParticle) => {
			gridParticle.color = color
			anime({
				targets: gridParticle,
				alpha: gridParticle.alpha < 0.4 ? 0.4 : gridParticle.alpha,
				duration: 100,
				easing: 'easeInOutQuad',
	
				complete: () => {
					if (!changeColor)
						gridParticle.color = oldColor
				}
			})
		})
	}
}

class GridParticle extends DrawableGameObject {
	width: number
	height: number
	alpha: number
	initialAlpha: number


	constructor({ position, width, height, color, initialAlpha = 0.05, ctx }: {
		position: { x: number, y: number },
		width: number,
		height: number,
		color: string,
		initialAlpha?: number,
		ctx: CanvasRenderingContext2D
	}) {
		super({ position, color, ctx })
		this.width = width
		this.height = height
		this.color = color
		this.alpha = initialAlpha
		this.initialAlpha = initialAlpha
		this.ctx = ctx
	}

	draw() {
		this.ctx.save()
		this.ctx.globalAlpha = this.alpha
		this.ctx.beginPath()
		this.ctx.rect(this.position.x, this.position.y, this.width, this.height)
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.restore()
	}

	update() {
		this.draw()
	}

}
