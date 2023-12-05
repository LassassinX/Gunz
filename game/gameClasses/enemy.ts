import addExplosion from "../gameFunctions/addExplosion"
import spawnBullet from "../gameFunctions/spawnBullet"
import { playSoundEffect } from "../lib/initCanvas"
import { DrawableGameObject, DrawableObject, GameObject } from "../lib/smolGame/components"
import ParticleObject from "./particleObject"

export class Enemy extends ParticleObject implements DrawableObject{
	size: number
	ctx: CanvasRenderingContext2D
	canvas: HTMLCanvasElement
	enemySpawnPadding: number
	color: string

	constructor({ position, velocity, size, ctx, canvas, enemySpawnPadding, color }: {
		position: { x: number, y: number },
		velocity: { x: number, y: number },
		size: number,
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		enemySpawnPadding: number,
		color: string
	}) {
		super({ position, velocity })
		this.ctx = ctx
		this.canvas = canvas
		this.size = size
		this.enemySpawnPadding = enemySpawnPadding
		this.color = color
	}

	draw(): void {
	}

	checkBounds() {
		if (this.position.x > this.canvas.width + this.enemySpawnPadding || this.position.x < 0 - this.enemySpawnPadding || this.position.y > this.canvas.height + this.enemySpawnPadding || this.position.y < 0 - this.enemySpawnPadding) {
			this.isAlive = false
		}
	}

	kill(soundEffect: string, volume: number) {
		this.isAlive = false

		// remove enemy
		addExplosion({
			position: this.position,
			colors: [this.color],
			minRadius: 5,
			maxRadius: 10,
			minVelocity: 1,
			maxVelocity: 5,
			dampingAmount: 0.95,
			ctx: this.ctx,
		})
	
		// play sound
		playSoundEffect(soundEffect, volume)
	}
}

export class SquareEnemy extends Enemy implements DrawableGameObject {
	rotation: number

	constructor({ position, size, color, velocity, ctx, canvas, enemySpawnPadding }: {
		position: { x: number, y: number },
		size: number,
		color: string,
		velocity: { x: number, y: number },
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		enemySpawnPadding: number
	}) {
		super({ position, velocity, size, ctx, canvas, enemySpawnPadding, color })
		this.rotation = 0
	}

	draw() {
		this.ctx.save()
		this.ctx.translate(this.position.x, this.position.y)
		this.ctx.rotate(this.rotation)
		this.ctx.beginPath()
		this.ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size)
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.closePath()
		this.ctx.restore()
		this.rotation += 0.1
	}

	update() {
		this.updatePosition()
		this.checkBounds()
		this.draw()
	}

	kill() {
		
	}
}

export class TriangleEnemy extends Enemy {
	size: number
	rotation: number
	objectToPointAt: GameObject
	initialSpeed: number
	targetLocked: boolean
	dashed: boolean


	constructor({ position, size, color, velocity, objectToPointAt
		, rotation, ctx, canvas, searchPadding: enemySpawnPadding }: {
		position: { x: number, y: number },
		size: number,
		color: string,
		velocity: { x: number, y: number },
		objectToPointAt: GameObject,
		rotation: number,
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		searchPadding: number
	}) {
		super({ position, velocity, size, ctx, canvas, enemySpawnPadding, color })
		this.size = size
		this.color = color
		this.rotation = rotation
		this.objectToPointAt = objectToPointAt
		this.initialSpeed = Math.hypot(this.velocity.x, this.velocity.y)
		this.targetLocked = false
		this.dashed = false
	}

	draw() {
		this.ctx.save()
		this.ctx.translate(this.position.x, this.position.y)
		this.ctx.rotate(this.rotation)
		this.ctx.beginPath()
		this.ctx.moveTo(this.size * 2, 0)
		this.ctx.lineTo(-this.size * Math.cos(Math.PI / 3), this.size * Math.sin(Math.PI / 3))
		this.ctx.lineTo(-this.size * Math.cos(Math.PI / 3), -this.size * Math.sin(Math.PI / 3))
		this.ctx.closePath()
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.restore()

		if (this.targetLocked) {
			this.rotation += this.adjustAngleTowardsPlayer()
		}
	}

	setRotation(value: number) {
		this.rotation = value % (Math.PI * 2)
	}

	adjustAngleTowardsPlayer() {
		const angle = Math.atan2(this.objectToPointAt.position.y - this.position.y, this.objectToPointAt.position.x - this.position.x)

		let angleDifference = angle - this.rotation
		if (angleDifference > Math.PI) {
			angleDifference -= Math.PI * 2
		}
		if (angleDifference < -Math.PI) {
			angleDifference += Math.PI * 2
		}
		
		// cap the angle difference
		if (angleDifference > 0.05) {
			angleDifference = 0.05
		} else if (angleDifference < -0.05) {
			angleDifference = -0.05
		}

		return angleDifference
	}

	checkIfInRange() {
		if (this.position.x > this.enemySpawnPadding && this.position.x < this.canvas.width - this.enemySpawnPadding && this.position.y > this.enemySpawnPadding && this.position.y < this.canvas.height - this.enemySpawnPadding) {
			this.targetLocked = true
		}
	}

	dash() {
		this.targetLocked = false

		if (!this.dashed) {
			this.setDashVelocity()
			this.dashed = true
		}
	}

	setDashVelocity() {
		const speed = this.initialSpeed * 1.5
		this.velocity.x = speed * Math.cos(this.rotation)
		this.velocity.y = speed * Math.sin(this.rotation)
	}

	update() {
		this.updatePosition()
		this.checkBounds()

		if (!this.dashed)
			this.checkIfInRange()

		if (this.targetLocked) {
			this.dampVelocity()

			setTimeout(() => {
				this.dash()
			}, 2000)
		}
		this.draw()
	}

}

export class DiamondEnemy extends TriangleEnemy {
	shootingInterval: NodeJS.Timeout | null
	shootingSoundEffect: string
	shootingVolume: number

	constructor({ position, size, color, velocity, objectToPointAt, rotation, ctx, canvas, enemySpawnPadding, shootingSoundEffect, shootingVolume
	 }: {
		position: { x: number, y: number },
		size: number,
		color: string,
		velocity: { x: number, y: number },
		objectToPointAt: GameObject,
		rotation: number,
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		enemySpawnPadding: number,
		shootingSoundEffect: string,
		shootingVolume: number
	}) {
		super({ position, size, color, velocity, objectToPointAt, rotation, ctx, canvas, searchPadding: enemySpawnPadding })
		this.shootingInterval = null
		this.shootingSoundEffect = shootingSoundEffect
		this.shootingVolume = shootingVolume
	}

	draw() {
		this.ctx.save()
		this.ctx.translate(this.position.x, this.position.y)
		this.ctx.rotate(this.rotation)
		this.ctx.beginPath()
		this.ctx.moveTo(this.size * 2, 0)
		this.ctx.lineTo(-this.size * Math.cos(Math.PI / 3), this.size * Math.sin(Math.PI / 3))
		this.ctx.lineTo(-this.size * Math.cos(Math.PI / 3) + this.size * 0.4, 0)
		this.ctx.lineTo(-this.size * Math.cos(Math.PI / 3), -this.size * Math.sin(Math.PI / 3))
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.restore()

		if (this.targetLocked) {
			this.rotation += this.adjustAngleTowardsPlayer()
		}
	}

	update() {
		this.updatePosition()
		this.checkBounds()

		if (!this.dashed)
			this.checkIfInRange()

		if (this.targetLocked) {
			this.dampVelocity()

			if (this.shootingInterval === null)
				this.shootingInterval = setInterval(() => {
					if (this.isAlive) {
						spawnBullet({
							isEnemy: true,
							bulletSpawner: this,
							bulletSpeed: 5,
							ctx: this.ctx,
							radius: 5,
							shootingCoordinates: this.objectToPointAt.position,
							soundEffect: this.shootingSoundEffect,
							volume: this.shootingVolume,
						})
					}
				}, 1500)

			setTimeout(() => {
				this.dash()
			}, 8000)
		}
		this.draw()
	}

}

export class CircleEnemy extends Enemy {
	playerToFollow: GameObject

	constructor({ position, size, color, objectToFollow, velocity, ctx, canvas, enemySpawnPadding }: {
		position: { x: number, y: number },
		size: number,
		color: string,
		objectToFollow: GameObject,
		velocity: { x: number, y: number },
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		enemySpawnPadding: number
	}) {
		super({ position, velocity, size, ctx, canvas, enemySpawnPadding, color })
		this.playerToFollow = objectToFollow
	}

	draw() {
		this.ctx.beginPath()
		this.ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2, false)
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.closePath()
	}

	updatePosition() {
		const angle = Math.atan2(this.playerToFollow.position.y - this.position.y, this.playerToFollow.position.x - this.position.x)

		this.position.x += Math.cos(angle) * this.velocity.x
		this.position.y += Math.sin(angle) * this.velocity.y
	}

	update() {
		this.updatePosition()
		this.checkBounds()
		this.draw()
	}
}

