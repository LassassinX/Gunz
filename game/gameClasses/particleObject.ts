import { DrawableObject, GameObject } from '../lib/smolGame/components'
export default class ParticleObject extends GameObject {
	velocity: {
		x: number
		y: number
	}
	
	dampingAmount: number
	alpha: number

	constructor({
		position = {
			x: 0,
			y: 0
		},
		velocity = {
			x: 0,
			y: 0
		}, dampingAmount = 0.95, alpha = 1 }) {
		super({ position })

		this.velocity = { ...velocity }
		this.alpha = alpha
		this.dampingAmount = dampingAmount
	}

	dampVelocity() {
		this.velocity.x *= this.dampingAmount
		this.velocity.y *= this.dampingAmount
	}

	updatePosition() {
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
	}
}