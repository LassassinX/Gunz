import './styles.css';
import { canvas, ctx, renderLoop, playSoundEffect } from './lib/initCanvas';
import { GameObject, CircularRigidBody } from './lib/smolGame/components';
import { randomRange, getRandomFromArray, randomRangeInt } from './assets/sounds/utils/functions';
import anime from 'animejs/lib/anime.es.js';

import playerShootSound from './assets/sounds/player-shoot.wav'
import enemyShootSound from './assets/sounds/enemy-shoot.wav'
import bulletImpactSound from './assets/sounds/bullet-impact.wav'

import bigExplosionSound1 from './assets/sounds/big-explosion-1.wav'
import bigExplosionSound2 from './assets/sounds/big-explosion-2.wav'
import bigExplosionSound3 from './assets/sounds/big-explosion-3.wav'
import bigExplosionSound4 from './assets/sounds/big-explosion-4.wav'

import gameplayLoop from './assets/sounds/gameplay-loop.mp3'

const bigExplosionSounds = [bigExplosionSound1, bigExplosionSound3, bigExplosionSound4]
const globalVolume = 1

class ParticleObject extends GameObject {
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

class GridParticle extends GameObject {
	constructor({ position, size, color, initialAlpha = 0.05 }) {
		super({ position })
		this.size = size
		this.color = color
		this.alpha = initialAlpha
		this.initialAlpha = initialAlpha
	}

	draw() {
		ctx.save()
		ctx.globalAlpha = this.alpha
		ctx.beginPath()
		ctx.rect(this.position.x, this.position.y, this.size, this.size * 1.5)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.restore()
	}

	update() {
		this.draw()
	}

}

class Player extends ParticleObject {
	constructor({ position, radius, color, strokeColor = 'red', lives = 3, onDeath, onLifeLost }) {
		super({
			position,
			dampingAmount: 0.95
		})
		this.radius = radius
		this.color = color
		this.strokeColor = strokeColor
		this.lives = lives
		this.speed = 0.05
		this.speedLimit = 3
		this.onDeath = onDeath
		this.onLifeLost = onLifeLost
		this.moveMap = {
			'KeyW': (value) => {
				this.setPlayerMovement('movingUp', value)
			},
			'KeyS': (value) => {
				this.setPlayerMovement('movingDown', value)
			},
			'KeyA': (value) => {
				this.setPlayerMovement('movingLeft', value)
			},
			'KeyD': (value) => {
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

	setPlayerMovement(movement, movementValue) {
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
		// this.velY -= this.speed
		this.velocity.y -= this.speed
	}

	moveDown() {
		// this.velY += this.speed
		this.velocity.y += this.speed
	}

	moveLeft() {
		// this.velX -= this.speed
		this.velocity.x -= this.speed
	}

	moveRight() {
		// this.velX += this.speed
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
		addExplosion({
			position: this.position,
			colors: [this.color],
			numberOfParticles: 25,
			minRadius: 5,
			maxRadius: 10,
			minVelocity: 1,
			maxVelocity: 5,
			dampingAmount: 0.95
		})

		if (this.onDeath)
			this.onDeath()
		// shake screen
	}

	checkBounds() {
		if (this.position.x > canvas.width) {
			this.position.x = 0
		} else if (this.position.x < 0) {
			this.position.x = canvas.width
		}

		if (this.position.y > canvas.height) {
			this.position.y = 0
		} else if (this.position.y < 0) {
			this.position.y = canvas.height
		}
		// resolve speed 
		// const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY)
		const speed = Math.hypot(this.velocity.x, this.velocity.y)

		if (Math.abs(speed) >= this.speedLimit) {
			// const directionX = this.velX / speed
			// const directionY = this.velY / speed

			// this.velX = directionX * this.speedLimit
			// this.velY = directionY * this.speedLimit
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
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.strokeStyle = this.strokeColor
		ctx.lineWidth = 3
		ctx.stroke()
		ctx.closePath()
	}

	update() {
		this.checkBounds()
		this.updatePosition()
		this.updateMovement()
		this.draw()
	}
}

class Healthbar extends GameObject {
	constructor({ position, amount, width, height, barGap, skewAngle, activeColor, inactiveColor }) {
		super({ position })
		this.amountOfActiveBars = amount
		this.amountOfBars = amount
		this.width = width
		this.height = height
		this.barGap = barGap
		this.skewAngle = skewAngle
		this.activeColor = activeColor
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
			ctx.save()
			if (diff > 0) {
				ctx.fillStyle = this.inactiveColor
				ctx.globalAlpha = 0.2
				ctx.translate(0, 10)
				diff--
			} else {
				ctx.fillStyle = this.activeColor
			}

			ctx.setTransform(1, 0, Math.tan(this.skewAngle), 1, 0, 0)
			ctx.beginPath()
			ctx.rect(this.position.x + (this.width + this.barGap) * i, this.position.y, this.width, this.height)
			ctx.fill()
			ctx.closePath()
			ctx.restore()
		}
	}

	update() {
		this.draw()
	}
}


class Bullet extends ParticleObject {
	constructor({ position, radius, color, velocity, angle, isEnemy = false }) {
		super({ position, velocity })
		this.radius = radius
		this.color = color
		this.angle = angle
		this.isEnemy = isEnemy
	}

	draw() {
		if (this.radius <= 0 || this.isAlive === false) {
			return
		}
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.closePath()
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

let bulletHue = 0

function spawnPlayerBullet(mouseY, mouseX) {
	const angle = Math.atan2(mouseY - player.position.y, mouseX - player.position.x);
	const speed = 10;
	const bullet = new Bullet({
		position: player.position, velocity: {
			x: speed,
			y: speed
		}, radius: 7, color: `hsl(${bulletHue}, 100%, 50%)`, angle
	});
	const bulletRigidBody = new CircularRigidBody(bullet, bullet.radius);

	rigidBodies.push(bulletRigidBody);
	gameObjects.push(bullet);

	anime({
		targets: bullet,
		color: `hsl(${bulletHue + 10}, 100%, 50%)`,
		duration: 100,
		easing: 'easeInOutQuad',
		update: () => {
			player.strokeColor = bullet.color
		},
		complete: () => {
			bulletHue = (bulletHue + 10) % 360;
		}
	})

	// recoil
	player.velocity.x -= Math.cos(angle) * 0.5;
	player.velocity.y -= Math.sin(angle) * 0.5;

	addExplosion({
		position: player.position,
		colors: [bullet.color],
		startingAngle: bullet.angle,
		angleSpan: 90 * Math.PI / 180,
		minRadius: 2,
		maxRadius: 3,
		minVelocity: 4 + Math.hypot(player.velocity.x, player.velocity.y),
		maxVelocity: 4 + Math.hypot(player.velocity.x, player.velocity.y),
		dampingAmount: 0.98,
		numberOfParticles: 7,
	})

	// play sound
	playSoundEffect(playerShootSound, globalVolume)
}

function spawnEnemyBullet(enemy, angle) {
	const speed = 5;
	const bullet = new Bullet({
		position: enemy.position, velocity: {
			x: speed,
			y: speed
		}, radius: 4, color: enemy.color, angle,
		isEnemy: true
	});
	const bulletRigidBody = new CircularRigidBody(bullet, bullet.radius);

	rigidBodies.push(bulletRigidBody);
	gameObjects.push(bullet);

	// play sound
	playSoundEffect(enemyShootSound, globalVolume + 0.1)
}

document.addEventListener('mousedown', (e) => {
	const mouseX = e.clientX
	const mouseY = e.clientY

	// get angle between player and mouse in degrees
	if (player.isAlive)
		spawnPlayerBullet(mouseY, mouseX);
})

class Enemy extends ParticleObject {
	constructor({ position, velocity, size }) {
		super({ position, velocity })
		this.size = size
	}

	checkBounds() {
		if (this.position.x > canvas.width + enemySpawnPadding || this.position.x < 0 - enemySpawnPadding || this.position.y > canvas.height + enemySpawnPadding || this.position.y < 0 - enemySpawnPadding) {
			this.isAlive = false
		}
	}
}

class SquareEnemy extends Enemy {
	constructor({ position, size, color, velocity }) {
		super({ position, velocity, size })
		this.color = color
		this.rotation = 0
	}

	draw() {
		ctx.save()
		ctx.translate(this.position.x, this.position.y)
		ctx.rotate(this.rotation)
		ctx.beginPath()
		ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.closePath()
		ctx.restore()
		this.rotation += 0.1
	}

	update() {
		this.updatePosition()
		this.checkBounds()
		this.draw()
	}
}

class TriangleEnemy extends Enemy {
	constructor({ position, size, color, velocity, playerToPointAt, rotation }) {
		super({ position, velocity, size })
		this.size = size
		this.color = color
		this.rotation = rotation
		this.playerToPointAt = playerToPointAt
		this.initialSpeed = Math.hypot(this.velocity.x, this.velocity.y)
		this.targetLocked = false
		this.dashed = false
	}

	draw() {
		ctx.save()
		ctx.translate(this.position.x, this.position.y)
		ctx.rotate(this.rotation)
		ctx.beginPath()
		ctx.moveTo(this.size * 2, 0)
		ctx.lineTo(-this.size * Math.cos(Math.PI / 3), this.size * Math.sin(Math.PI / 3))
		ctx.lineTo(-this.size * Math.cos(Math.PI / 3), -this.size * Math.sin(Math.PI / 3))
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.restore()

		if (this.targetLocked) {
			this.rotation += this.adjustAngleTowardsPlayer()
		}
	}

	setRotation(value) {
		this.rotation = value % (Math.PI * 2)
	}

	adjustAngleTowardsPlayer() {
		const angle = Math.atan2(this.playerToPointAt.position.y - this.position.y, this.playerToPointAt.position.x - this.position.x)

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
		if (this.position.x > enemySpawnPadding && this.position.x < canvas.width - enemySpawnPadding && this.position.y > enemySpawnPadding && this.position.y < canvas.height - enemySpawnPadding) {
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

class DiamondEnemy extends TriangleEnemy {
	constructor({ position, size, color, velocity, playerToPointAt, rotation }) {
		super({ position, size, color, velocity, playerToPointAt, rotation })

		this.shootingInterval = null
	}

	draw() {
		ctx.save()
		ctx.translate(this.position.x, this.position.y)
		ctx.rotate(this.rotation)
		ctx.beginPath()
		ctx.moveTo(this.size * 2, 0)
		ctx.lineTo(-this.size * Math.cos(Math.PI / 3), this.size * Math.sin(Math.PI / 3))
		ctx.lineTo(-this.size * Math.cos(Math.PI / 3) + this.size * 0.4, 0)
		ctx.lineTo(-this.size * Math.cos(Math.PI / 3), -this.size * Math.sin(Math.PI / 3))
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.restore()

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
					if (this.isAlive)
						spawnEnemyBullet(this, this.rotation)
				}, 1500)

			setTimeout(() => {
				this.dash()
			}, 8000)
		}
		this.draw()
	}

}

class CircleEnemy extends Enemy {
	constructor({ position, size, color, playerToFollow, velocity }) {
		super({ position, velocity, size })
		this.color = color
		this.playerToFollow = playerToFollow
	}

	draw() {
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.closePath()
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


const enemySpawnPadding = 100

const getEnemySpawnLocation = (player) => {
	// spawn enemies a region outside of the screen,
	const x = Math.random() > 0.5 ? randomRange(canvas.width, canvas.width + enemySpawnPadding) : randomRange(-enemySpawnPadding, 0)
	const y = Math.random() > 0.5 ? randomRange(canvas.height, canvas.height + enemySpawnPadding) : randomRange(-enemySpawnPadding, 0)

	if (x >= player.position.x + player.radius && x <= player.position.y - player.radius && y >= player.position.y + player.radius && y <= player.position.y - player.radius) {
		return getEnemySpawnLocation()
	}
	return { x, y }
}

const randomColors = ['#ff2a6d', '#d1f7ff', '#05d9e8', '#7f46fa', '#053fed', '#f37b29', '#7ED7C1', '#A7D397', '#D4ADFC', '#FA2FB5', '#10d902']

const typeOfEnemies = ['circle', 'square', 'triangle', 'diamond']

const spawnEnemy = () => {
	const position = getEnemySpawnLocation(player)
	// lets see the types of enemies
	if (getRandomFromArray(typeOfEnemies) === 'circle') {
		spawnCircleEnemy(position)
	} else if (getRandomFromArray(typeOfEnemies) === 'square') {
		spawnSquareEnemy(position)
	} else if (getRandomFromArray(typeOfEnemies) === 'triangle') {
		spawnTriangleEnemy(position)
	} else if (getRandomFromArray(typeOfEnemies) === 'diamond') {
		spawnDiamondEnemy(position)
	}
}

const spawnDiamondEnemy = (position) => {
	const speed = 10
	// get the angle between the enemy and the middle of the canvas
	let angle = Math.atan2(canvas.height / 2 - position.y, canvas.width / 2 - position.x)
	angle = randomRange(angle - Math.PI / 4, angle + Math.PI / 4)
	const enemy = new DiamondEnemy({
		position, size: randomRange(15, 25), color: getRandomFromArray(randomColors), velocity: {
			x: speed * Math.cos(angle),
			y: speed * Math.sin(angle),
		}, rotation: angle,
		playerToPointAt: player
	})
	const enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
	gameObjects.push(enemy)
	rigidBodies.push(enemyRigidBody)
}

const spawnTriangleEnemy = (position) => {
	const speed = 10
	// get the angle between the enemy and the middle of the canvas
	let angle = Math.atan2(canvas.height / 2 - position.y, canvas.width / 2 - position.x)
	angle = randomRange(angle - Math.PI / 4, angle + Math.PI / 4)

	const enemy = new TriangleEnemy({
		position, size: randomRange(15, 25), color: getRandomFromArray(randomColors), velocity: {
			x: speed * Math.cos(angle),
			y: speed * Math.sin(angle),
		}, rotation: angle,
		playerToPointAt: player
	})
	const enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
	gameObjects.push(enemy)
	rigidBodies.push(enemyRigidBody)
}

const spawnCircleEnemy = (position) => {
	const speed = 2
	const enemy = new CircleEnemy({
		position, size: randomRange(20, 35), color: getRandomFromArray(randomColors), playerToFollow: player,
		velocity: {
			x: speed,
			y: speed,
		}
	})
	const enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
	gameObjects.push(enemy)
	rigidBodies.push(enemyRigidBody)
}

const spawnSquareEnemy = (position) => {
	const speed = 1
	// get the angle between the enemy and the middle of the canvas
	let angle = Math.atan2(canvas.height / 2 - position.y, canvas.width / 2 - position.x)
	angle = randomRange(angle - Math.PI / 4, angle + Math.PI / 4)

	const enemy = new SquareEnemy({
		position, size: randomRangeInt(75, 150), color: getRandomFromArray(randomColors), velocity: {
			x: speed * Math.cos(angle),
			y: speed * Math.sin(angle)
		}
	})

	const enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
	gameObjects.push(enemy)
	rigidBodies.push(enemyRigidBody)
}


let gridFlashing = false

const blurAndShakeCanvas = ({
	blur = 3,
	shake = {
		min: 10,
		max: 15
	},
	zoom = {
		min: 1.01,
		max: 1.03
	},
	duration = 300,
} = {}) => {
	shake = randomRange(shake.min, shake.max)
	const shakeY = randomRange(-shake, shake)
	const shakeX = randomRange(-shake, shake)
	const zoomAmount = randomRange(zoom.min, zoom.max)
	const easing = 'easeOutInSine'
	// use a timeline 
	const timeline = anime.timeline({
		easing: easing,
		targets: canvas,
	});

	// Animation 1: Apply blur, translation, and shake
	timeline.add({
		filter: `blur(${blur}px)`,
		translateX: shakeX,
		translateY: shakeY,
		scaleX: zoomAmount,
		scaleY: zoomAmount,
		duration: duration / 3,
	}).add({
		// Animation 2: Shake back
		translateX: -shakeX,
		translateY: -shakeY,
		duration: duration / 3,
	}).add({
		// Animation 3: Become normal
		filter: `blur(0px)`,
		duration: duration / 3,
		scaleX: 1,
		scaleY: 1,
		translateX: 0,
		translateY: 0,
	});

	// Start the timeline
	timeline.play();

}

const killEnemy = (enemy) => {
	enemy.isAlive = false

	// remove enemy
	addExplosion({
		position: enemy.position,
		colors: [enemy.color],
		minRadius: 5,
		maxRadius: 10,
		minVelocity: 1,
		maxVelocity: 5,
		dampingAmount: 0.95
	})

	// play sound
	playSoundEffect(getRandomFromArray(bigExplosionSounds), globalVolume)
}
class ExplosionParticle extends ParticleObject {
	constructor({ position, radius, color, velocity, dampingAmount, alpha = 1 }) {
		super({ position, velocity, dampingAmount, alpha })
		this.radius = radius
		this.color = color
	}

	draw() {
		if (this.radius <= 0) {
			return
		}
		ctx.save()
		ctx.globalAlpha = this.alpha
		ctx.beginPath()
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
		ctx.fillStyle = this.color
		ctx.fill()
		ctx.closePath()
		ctx.restore()
	}

	update() {
		this.updatePosition()
		this.dampVelocity()
		this.alpha -= 0.01
		this.radius -= 0.1

		if (this.radius <= 0) {
			this.isAlive = false
		}

		this.draw()
	}
}

let particleCount = 0
let maxParticleCount = 100

const addExplosion = ({ position, colors, startingAngle = 0, angleSpan = 360 * Math.PI / 180,
	minRadius = 2, maxRadius = 5, minVelocity = 1, maxVelocity = 10,
	numberOfParticles = 25, dampingAmount = 0.97
}) => {
	// generate particles between startingAngle and startingAngle + angleSpan
	const endingAngle = startingAngle + angleSpan / 2
	startingAngle = startingAngle - angleSpan / 2

	for (let i = 0; i < numberOfParticles; i++) {
		const velocity = randomRange(minVelocity, maxVelocity)
		const angle = randomRange(startingAngle, endingAngle)
		const particle = new ExplosionParticle({
			position, radius: randomRange(minRadius, maxRadius), color: getRandomFromArray(colors), velocity: {
				x: Math.cos(angle) * velocity,
				y: Math.sin(angle) * velocity,
			}, dampingAmount: dampingAmount
		})
		if (particleCount < maxParticleCount) {
			gameObjects.push(particle)
			particleCount += 1
		}
	}
}

const drawDiamond = (x, y, size, lineWidth, color) => {
	ctx.save()
	ctx.translate(x, y)
	ctx.rotate(Math.PI / 4)
	ctx.beginPath()
	ctx.rect(-size / 2, -size / 2, size, size)
	ctx.strokeStyle = color
	ctx.lineWidth = lineWidth
	ctx.stroke()
	ctx.closePath()
	ctx.restore()
}

const drawCursor = () => {
	drawDiamond(cursorMouseX, cursorMouseY, 30, 2, player.strokeColor)
	drawDiamond(cursorMouseX, cursorMouseY, 15, 1.5, player.strokeColor)
}

class FrameCounter {
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

	at(milliseconds, callBack) {
		const now = new Date()
		const difference = now - this.date
		if (difference >= milliseconds) {
			callBack()
			this.date = new Date()
		}
	}
}

const frameCounter = new FrameCounter()

const gameObjects = []
const rigidBodies = []
const grid = {
	particles: [],
	rows: 0,
	columns: 0
}

const initializeGrid = () => {
	// make a grid of particles for the bg, that spans the entire canvas
	const particleGapX = 45
	const particleGapY = 30

	const squareSize = 8
	const gridPaddingX = particleGapX / 2
	const gridPaddingY = particleGapY / 2
	grid.rows = 0
	for (let i = gridPaddingY; i < canvas.height; i += particleGapY) {
		grid.columns = 0
		for (let j = gridPaddingX; j < canvas.width; j += particleGapX) {
			const particle = new GridParticle({
				position: {
					x: j,
					y: i
				},
				size: squareSize,
				color: 'white'
			})
			grid.particles.push(particle)
			grid.columns += 1
		}
		grid.rows += 1
	}
}


const flashGrid = (color, preserveColor = true) => {
	// flash grid
	gridFlashing = true
	let oldColor = grid.particles[0].color

	setTimeout(() => {
		gridFlashing = false
	}, 100)

	grid.particles.forEach((gridParticle) => {
		gridParticle.color = color
		anime({
			targets: gridParticle,
			alpha: gridParticle.alpha < 0.4 ? 0.4 : gridParticle.alpha,
			duration: 100,
			easing: 'easeInOutQuad',

			complete: () => {
				if (!preserveColor)
					gridParticle.color = oldColor
			}
		})
	})
}

const player = new Player({
	position: {
		x: canvas.width / 2,
		y: canvas.height / 2,
	}, radius: 12,
	color: 'white',
	lives: 3,
	onLifeLost: () => {
		healthBar.decrement()
	},
	onDeath: () => {
		playSoundEffect(bigExplosionSound2, globalVolume + 0.1)
	}
})

const barWidth = 25
const barGap = 10
const healthBarRightPadding = 10
const healthBar = new Healthbar({
	position: {
		x: canvas.width - ((barWidth + barGap) * player.lives) - healthBarRightPadding,
		y: 20
	}, amount: player.lives,
	activeColor: 'red',
	width: barWidth,
	height: 5,
	barGap: barGap,
	skewAngle: -0.5,
	inactiveColor: 'white'
})

const playerDamageColor = '#ff2a6d'

const playerRigidBody = new CircularRigidBody(player, player.radius)

let cursorMouseX = 0
let cursorMouseY = 0
canvas.addEventListener('mousemove', (e) => {
	cursorMouseX = e.clientX
	cursorMouseY = e.clientY
})

let gameplayLoopAudio
let audioContext
let audioAnalyser
let audioDataArray
let isChorus = false
let rangeOfRows
let rangeOfCols
let eqFactors = {
	rowFactor: 4,
	colFactor: 4
}
let equalizerAlpha = 0.12

const init = () => {
	gameObjects.push(player)
	rigidBodies.push(playerRigidBody)
	gameObjects.push(healthBar)


	for (let i = 0; i < 1; i++) {
		spawnEnemy()
	}

	initializeGrid()

	audioContext = new AudioContext()
	audioAnalyser = audioContext.createAnalyser()
	audioAnalyser.fftSize = Math.pow(2, Math.ceil(Math.log2(grid.columns))) * 2
	audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount)

	// play looping music
	gameplayLoopAudio = playSoundEffect(gameplayLoop, globalVolume - globalVolume / 10, true)
	let audioSource = audioContext.createMediaElementSource(gameplayLoopAudio)
	audioSource.connect(audioAnalyser)
	audioAnalyser.connect(audioContext.destination)
}



const animation = () => {
	// get audio data
	audioAnalyser.getByteFrequencyData(audioDataArray)
	rangeOfCols = Math.floor(grid.columns / eqFactors.colFactor)
	rangeOfRows = Math.floor(grid.rows / eqFactors.rowFactor)
	debugger
	if ((gameplayLoopAudio.currentTime >= 45 && gameplayLoopAudio.currentTime <= 100 || gameplayLoopAudio.currentTime >= 158 && gameplayLoopAudio.currentTime <= 225) && !isChorus) {
		isChorus = true
		anime({
			targets: eqFactors,
			rowFactor: 2,
			duration: 1000,
			easing: 'easeInOutQuad',
		})
	} else {
		isChorus = false
		anime({
			targets: eqFactors,
			rowFactor: 4,
			duration: 1000,
			easing: 'easeInOutQuad',
		})
	}

	ctx.fillStyle = `rgba(5, 5, 5, 0.5)`
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	grid.particles.forEach((gridParticle, i) => {
		const particleRowIndex = Math.floor(i / grid.columns)
		const particleColumnIndex = i % grid.columns
		const inverseParticleRowIndex = grid.rows - particleRowIndex - 1
		const inverseParticleColumnIndex = grid.columns - particleColumnIndex - 1

		const searchRadius = 150
		const distance = Math.hypot(player.position.x - gridParticle.position.x, player.position.y - gridParticle.position.y)

		const maxFrequency = 255
		
		const numberOfRowParticlesToLightUp = Math.floor((audioDataArray[particleColumnIndex > grid.columns/2 ? grid.columns - particleColumnIndex : particleColumnIndex] / maxFrequency) * rangeOfRows) 

		debugger
		const numberOfColParticlesToLightUp = Math.floor((audioDataArray[particleRowIndex > grid.rows/2 ? grid.rows - particleRowIndex : particleRowIndex] / maxFrequency) * rangeOfCols)

		if (!gridFlashing)
			if (distance < searchRadius && player.isAlive) {
				if (distance < searchRadius / 2.5) { 
					const threshold = 0.3
					gridParticle.alpha = (distance / searchRadius) - threshold < 0 ? 0 : (distance / searchRadius) - threshold
				} else {
					gridParticle.alpha = 1 - (distance / searchRadius) < gridParticle.initialAlpha ? gridParticle.initialAlpha : 1 - (distance / searchRadius)

					// if (particleRowIndex >= numberOfParticlesToLightUp && gridParticle.alpha <= equalizerAlpha) {
					// 	gridParticle.alpha = equalizerAlpha
					// }
				}
			} else {
				gridParticle.alpha = gridParticle.initialAlpha
				// for vertical equalizer
				if (inverseParticleRowIndex < numberOfRowParticlesToLightUp || particleRowIndex < numberOfRowParticlesToLightUp) {
					gridParticle.alpha = equalizerAlpha
				}

				// for horizontal equalizer
				// if (inverseParticleColumnIndex < numberOfColParticlesToLightUp || particleColumnIndex < numberOfColParticlesToLightUp) {
				// 	gridParticle.alpha = equalizerAlpha
				// }
			}

		gridParticle.update()
	})
	gameObjects.forEach((gameObject, i) => {
		if (!gameObject.isAlive) {

			if (gameObject instanceof ExplosionParticle) {
				particleCount -= 1
			}

			gameObjects.splice(i, 1)
		} else {
			gameObject.update()
		}
	})

	rigidBodies.forEach((rigidBody, i) => {
		if (!rigidBody.gameObject.isAlive) {
			rigidBodies.splice(i, 1)
		} else {
			rigidBody.update()

			// check for collision with player and other enemy

			if (player.isAlive) {

				if ((rigidBody.gameObject instanceof Enemy || (rigidBody.gameObject instanceof Bullet && rigidBody.gameObject.isEnemy))
					&& rigidBody.checkCollision(playerRigidBody)
				) {

					// decrease number of lives
					player.decrementLives()
					const enemy = rigidBody.gameObject

					// add an explosion
					if (enemy instanceof Bullet) {
						addExplosion({
							position: player.position,
							colors: [enemy.color],
							startingAngle: enemy.angle + Math.PI,
							angleSpan: 120 * Math.PI / 180,
							numberOfParticles: 10,
						})

						addExplosion({
							position: enemy.position,
							colors: [player.color],
							startingAngle: enemy.angle,
							angleSpan: 120 * Math.PI / 180,
							numberOfParticles: 20,
						})

						enemy.isAlive = false

						// play sound
						playSoundEffect(bulletImpactSound, globalVolume)
					} else {
						addExplosion({
							position: player.position,
							colors: [enemy.color],
							startingAngle: Math.atan2(player.position.y - enemy.position.y, player.position.x - enemy.position.x) + Math.PI,
							angleSpan: 120 * Math.PI / 180,
							numberOfParticles: 10,
						})

						killEnemy(rigidBody.gameObject)
					}

					// kill enemy

					// shake screen
					blurAndShakeCanvas({
						shake: {
							min: 50,
							max: 100
						},
						zoom: {
							min: 1.01,
							max: 1.05
						}
					})

					flashGrid(playerDamageColor, false)
				}

				if (rigidBody.gameObject instanceof Bullet && rigidBody.gameObject.isEnemy === false) {
					const bullet = rigidBody.gameObject

					if (bullet.position.x > canvas.width || bullet.position.x < 0 || bullet.position.y > canvas.height || bullet.position.y < 0) {
						bullet.isAlive = false
					}

					rigidBodies.forEach((otherRigidBody, j) => {
						if (otherRigidBody.gameObject instanceof Enemy && rigidBody.checkCollision(otherRigidBody)) {
							const enemy = otherRigidBody.gameObject
							const enemyRigidBody = otherRigidBody
							// remove bullet
							bullet.isAlive = false

							// add explosion facing the direction of the enemy
							addExplosion({
								position: bullet.position,
								colors: [enemy.color],
								startingAngle: bullet.angle,
								angleSpan: 120 * Math.PI / 180,
								numberOfParticles: 10,
							})

							// add explosion facing the direction of the bullet
							addExplosion({
								position: bullet.position,
								colors: [bullet.color],
								startingAngle: bullet.angle + Math.PI,
								angleSpan: 120 * Math.PI / 180,
								numberOfParticles: 10,
							})

							// decrease enemy size
							anime({
								targets: enemy,
								size: enemy.size - 10,
								duration: 100,
								easing: 'easeInOutQuad',
								complete: () => {
									if (enemy.size <= 10) {
										killEnemy(enemy)

										// add a blur & shake effect
										blurAndShakeCanvas()

										// flash grid
										flashGrid(enemy.color)
									}
								}
							})

							anime({
								targets: enemyRigidBody,
								radius: enemyRigidBody.radius - 10,
								duration: 100,
								easing: 'easeInOutQuad',
							})

							// play sound
							playSoundEffect(bulletImpactSound, globalVolume)
						}
					})
				}
			}
		}
	})

	frameCounter.at(1000, () => {
		spawnEnemy()
	})

	frameCounter.incrementFrame()

	// draw cursor
	drawCursor()
}



let fpsCounter = document.getElementById('fps-counter');
let frameCount = 0;
let lastTime;

function updateFPS() {
	const now = performance.now();
	const elapsed = now - lastTime;

	if (elapsed >= 1000) {
		const fps = Math.round((frameCount * 1000) / elapsed);
		fpsCounter.innerText = 'FPS: ' + fps;

		frameCount = 0;
		lastTime = now;
	}

	frameCount++;

	requestAnimationFrame(updateFPS);
}

// Initial setup
lastTime = performance.now();
updateFPS();
let isStarted = false
document.addEventListener('click', () => {
	// play sound
	if (!isStarted) {
		init()
		renderLoop(animation)
		isStarted = true
	}
})