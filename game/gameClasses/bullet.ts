import { DrawableGameObject } from '../lib/smolGame/components.js'
import ParticleObject from './particleObject.js'
export default class Bullet extends ParticleObject implements DrawableGameObject{
	ctx: CanvasRenderingContext2D

	radius: number
	color: string
	angle: number
	isEnemy: boolean
	static BULLET_HUE: number = 0
	// static GetAndChangeBulletHue = () => Bullet.BULLET_HUE = (Bullet.BULLET_HUE + 10) % 360
	static SetBulletHue = (hue: number) => Bullet.BULLET_HUE = hue

	constructor({ position, radius, color, velocity, angle, isEnemy = false, ctx }: {
		position: { x: number, y: number },
		radius: number,
		color: string,
		velocity: { x: number, y: number },
		angle: number,
		isEnemy?: boolean,
		ctx: CanvasRenderingContext2D
	}) {
		super({ position, velocity })
		this.ctx = ctx
		this.radius = radius
		this.color = color
		this.angle = angle
		this.isEnemy = isEnemy
	}

	draw() {
		if (this.radius <= 0 || this.isAlive === false) {
			return
		}
		this.ctx.beginPath()
		this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.closePath()
	}

	updatePosition() {
		this.position.x += Math.cos(this.angle) * this.velocity.x
		this.position.y += Math.sin(this.angle) * this.velocity.y
	}

	update() {
		this.updatePosition()
		this.draw()
	}
}
