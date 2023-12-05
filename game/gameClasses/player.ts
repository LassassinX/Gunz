import ParticleObject from './particleObject'
import { DrawableGameObject } from '../lib/smolGame/components'
import spawnBullet from '../gameFunctions/spawnBullet'
import { ctx } from '../lib/initCanvas'
export default class Player extends ParticleObject implements DrawableGameObject {
	ctx: CanvasRenderingContext2D
	canvas: HTMLCanvasElement

	radius: number
	color: string
	strokeColor: string
	lives: number

	speed: number
	speedLimit: number

	onDeath?: Function
	onLifeLost?: Function

	moving: boolean
	movingMap: {
		movingUp: boolean,
		movingDown: boolean,
		movingLeft: boolean,
		movingRight: boolean,
		[key: string]: boolean
	}

	moveMap: {
		[key: string]: Function
	}

	constructor({ position, radius, color, strokeColor = 'red', lives = 3, onDeath, onLifeLost, ctx, canvas }: {
		position: { x: number, y: number },
		radius: number,
		color: string,
		strokeColor?: string,
		lives: number,
		onDeath?: Function,
		onLifeLost?: Function,
		ctx: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement
	}) {
		super({
			position,
			dampingAmount: 0.95
		})

		this.ctx = ctx
		this.canvas = canvas

		this.radius = radius
		this.color = color
		this.strokeColor = strokeColor
		this.lives = lives
		this.speed = 0.05
		this.speedLimit = 3
		this.onDeath = onDeath
		this.onLifeLost = onLifeLost
		this.moveMap = {
			'KeyW': (value: boolean) => {
				this.setPlayerMovement('movingUp', value)
			},
			'KeyS': (value: boolean) => {
				this.setPlayerMovement('movingDown', value)
			},
			'KeyA': (value: boolean) => {
				this.setPlayerMovement('movingLeft', value)
			},
			'KeyD': (value: boolean) => {
				this.setPlayerMovement('movingRight', value)
			}
		}

		this.moving = false

		this.movingMap = {
			movingUp: false,
			movingDown: false,
			movingLeft: false,
			movingRight: false,
		}


		// player movement
		document.addEventListener('keydown', (e) => {
			if (this.moveMap[e.code]) {
				this.moveMap[e.code](true)
			}
		})

		document.addEventListener('keyup', (e) => {
			if (this.moveMap[e.code]) {
				this.moveMap[e.code](false)
			}
		})
	}

	shoot({
		shootingCoordinates,
		soundEffect,
		volume,
	}: {
		shootingCoordinates: { x: number, y: number },
		soundEffect: string,
		volume: number,
	}) {
		if (this.isAlive)
			return spawnBullet({
				bulletSpawner: this,
				bulletSpeed: 20,
				ctx: this.ctx,
				isEnemy: false,
				radius: 5,
				shootingCoordinates,
				soundEffect,
				volume,
				useHueShift: true,
			});
	}
	setPlayerMovement(movement: string, movementValue: boolean) {
		Object.entries(this.movingMap).forEach(([key, value]) => {
			if (key === movement) {
				this.movingMap[key] = movementValue
			}
		})

		// check if all movement is false
		const allMovementFalse = Object.values(this.movingMap).every((value) => {
			return value === false
		})

		if (allMovementFalse) {
			this.moving = false
		} else {
			this.moving = true
		}
	}

	moveUp() {
		this.velocity.y -= this.speed
	}

	moveDown() {
		this.velocity.y += this.speed
	}

	moveLeft() {
		this.velocity.x -= this.speed
	}

	moveRight() {
		this.velocity.x += this.speed
	}

	decrementLives() {
		this.lives -= 1
		if (this.lives <= 0) {
			this.isAlive = false

			this.die()
		}

		if (this.onLifeLost)
			this.onLifeLost()
	}

	die() {
		// add an explosion
		// addExplosion({
		// 	position: this.position,
		// 	colors: [this.color],
		// 	numberOfParticles: 25,
		// 	minRadius: 5,
		// 	maxRadius: 10,
		// 	minVelocity: 1,
		// 	maxVelocity: 5,
		// 	dampingAmount: 0.95
		// })

		if (this.onDeath)
			this.onDeath()
		// shake screen
	}

	checkBounds() {
		if (this.position.x > this.canvas.width) {
			this.position.x = 0
		} else if (this.position.x < 0) {
			this.position.x = this.canvas.width
		}

		if (this.position.y > this.canvas.height) {
			this.position.y = 0
		} else if (this.position.y < 0) {
			this.position.y = this.canvas.height
		}
		// resolve speed 
		const speed = Math.hypot(this.velocity.x, this.velocity.y)

		if (Math.abs(speed) >= this.speedLimit) {
			this.velocity.x = this.velocity.x / speed * this.speedLimit
			this.velocity.y = this.velocity.y / speed * this.speedLimit
		}
	}

	updateMovement() {
		if (this.moving) {
			if (this.movingMap.movingUp)
				this.moveUp()
			if (this.movingMap.movingDown)
				this.moveDown()
			if (this.movingMap.movingLeft)
				this.moveLeft()
			if (this.movingMap.movingRight)
				this.moveRight()
		} else {
			this.dampVelocity()
		}
	}

	draw() {
		if (this.radius <= 0 || this.isAlive === false) {
			return
		}
		this.ctx.beginPath()
		this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
		this.ctx.fillStyle = this.color
		this.ctx.fill()
		this.ctx.strokeStyle = this.strokeColor
		this.ctx.lineWidth = 3
		this.ctx.stroke()
		this.ctx.closePath()
	}

	update() {
		this.checkBounds()
		this.updatePosition()
		this.updateMovement()
		this.draw()
	}
}
