import { DrawableGameObject } from "../lib/smolGame/components"
import ParticleObject from "./particleObject"

class ExplosionParticle extends ParticleObject implements DrawableGameObject{
	color: string
	ctx: CanvasRenderingContext2D
	radius: number
	static PARTICLE_COUNT: number = 0

	constructor({ position, radius, color, velocity, dampingAmount, alpha = 1, ctx }: {
		position: { x: number, y: number },
		radius: number,
		color: string,
		velocity: { x: number, y: number },
		dampingAmount: number,
		alpha?: number,
		ctx: CanvasRenderingContext2D
	}) {
		super({ position, velocity, dampingAmount, alpha })
		this.radius = radius
		this.color = color
		this.ctx = ctx
		ExplosionParticle.PARTICLE_COUNT++
	}
	
	draw() {
		if (this.radius <= 0) {
			return
		}
		this.ctx.save()
		this.ctx.globalAlpha = this.alpha
		this.ctx.beginPath()
		this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.closePath()
		this.ctx.restore()
	}

	update() {
		this.updatePosition()
		this.dampVelocity()
		this.alpha -= 0.01
		this.radius -= 0.1

		if (this.radius <= 0) {
			this.isAlive = false
			ExplosionParticle.PARTICLE_COUNT--
		}

		this.draw()
	}
}

export default ExplosionParticle