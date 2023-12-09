import { DrawableGameObject } from "../lib/smolGame/components";
import ParticleObject from "./particleObject";

export default class Score extends ParticleObject implements DrawableGameObject {
	score: number
	fontStyle: string
	alpha: number
	color: string;
	ctx: CanvasRenderingContext2D;
	fontSize: number;

	constructor({ ctx, position, color, score, fontStyle, fontSize }: {
		ctx: CanvasRenderingContext2D,
		position: { x: number, y: number },
		score: number,
		color: string,
		fontStyle: string,
		fontSize: number
	}) {
		super({position})
		this.score = score
		this.fontStyle = fontStyle
		this.alpha = 1
		this.color = color
		this.ctx = ctx
		this.velocity = { x: 0, y: -1.5 }
		this.fontSize = fontSize
	}


	draw(): void {
		this.ctx.save()
		this.ctx.textAlign = 'center'
		this.ctx.globalAlpha = this.alpha
		this.ctx.font = `${this.fontSize}px ${this.fontStyle}`;
		this.ctx.fillStyle = this.color
		this.ctx.fillText(`${this.score}`, this.position.x, this.position.y);
		this.ctx.restore()
	}

	update(): void {
		this.alpha -= 0.01
		if (this.alpha < 0) {
			this.alpha = 0
			this.isAlive = false
		}

		this.updatePosition()
		this.draw()
	}
} 