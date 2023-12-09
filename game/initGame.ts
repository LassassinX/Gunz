
import Player from './gameClasses/player';
import Healthbar from './gameClasses/healthbar';
import { CircularRigidBody, GameObject } from './lib/smolGame/components';

import * as Sounds from './gameUtils/sounds';
import * as CanvasUtils from './lib/canvasUtils';
import playSoundEffect from './gameFunctions/playSoundEffect';
import Grid from './gameClasses/grid';
import { CircleEnemy, DiamondEnemy, Enemy, EnemyType, SquareEnemy, TriangleEnemy } from './gameClasses/enemy';
import anime from 'animejs';
import Bullet from './gameClasses/bullet';
import addExplosion from './gameFunctions/addExplosion';
import { getRandomFromArray } from './utils/functions';
import FrameCounter from './gameClasses/frameCounter';
import spawnEnemy from './gameFunctions/spawnEnemy';
import ExplosionParticle from './gameClasses/explosionParticle';
import spawnBullet from './gameFunctions/spawnBullet';
import Score from './gameClasses/score';

// score
let currentScore = 0
const ENEMY_HIT_SCORE = 10
const killScores: {
	[key in EnemyType]: number
} = {
	[EnemyType.CIRCLE]: 100,
	[EnemyType.TRIANGE]: 150,
	[EnemyType.DIAMOND]: 200,
	[EnemyType.SQUARE]: 250,
}

const getEnemyType = (enemy: Enemy) => {
	if (enemy instanceof DiamondEnemy) return EnemyType.DIAMOND
	if (enemy instanceof CircleEnemy) return EnemyType.CIRCLE
	if (enemy instanceof TriangleEnemy) return EnemyType.TRIANGE
	if (enemy instanceof SquareEnemy) return EnemyType.SQUARE
}

const gameObjects: GameObject[] = []
const rigidBodies: CircularRigidBody[] = []
const playerDamageColor = '#ff2a6d'
const MAX_PARTICLE_COUNT = 100

let player: Player;
let playerRigidBody: CircularRigidBody;
let healthbar: Healthbar;
let grid: Grid;

let globalVolume = 1
let cursorMouseX: number | null
let cursorMouseY: number | null
let cursorRotation = 0

let gameplayLoopAudio: HTMLAudioElement
let audioContext: AudioContext
let audioAnalyser: AnalyserNode
let audioDataArray: Uint8Array
let rangeOfCols: number
let rangeOfRows: number
let eqFactors = {
	rowFactor: 4,
	colFactor: 4,
	equalizerAlpha: 0.12,
}

const initGame = ({
	canvas,
	ctx,
	renderLoop,
	setWidthAndHeight,
	highScoreElement,
	scoreFont: localFont,
}: {
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	renderLoop: (callback: () => void) => void,
	highScoreElement: HTMLElement,
	scoreFont: string,
	setWidthAndHeight: ({
		innerWidth,
		innerHeight
	}: {
		innerWidth: number,
		innerHeight: number
	}) => void
}) => {
	// functions
	const drawCursor = () => {
		if (!cursorMouseX || !cursorMouseY) return
		CanvasUtils.drawDiamond({
			ctx,
			x: cursorMouseX,
			y: cursorMouseY,
			size: 30,
			lineWidth: 2,
			color: player.strokeColor,
		})
		CanvasUtils.drawDiamond({
			ctx,
			x: cursorMouseX,
			y: cursorMouseY,
			size: 12,
			lineWidth: 1.5,
			color: player.strokeColor,
			rotation: -cursorRotation,
		})
	}

	const addExplosionToGameObjects = (explosionObjects: ExplosionParticle[][]) => {
		if (ExplosionParticle.PARTICLE_COUNT < MAX_PARTICLE_COUNT) {
			for (let i = 0; i < explosionObjects.length; i++) {
				const particles: ExplosionParticle[] = explosionObjects[i]

				for (let j = 0; j < particles.length; j++) {
					if (ExplosionParticle.PARTICLE_COUNT >= MAX_PARTICLE_COUNT) break
					gameObjects.push(particles[j])
					ExplosionParticle.PARTICLE_COUNT += 1
				}
			}

		}
	}

	let currentScoreIncreasingAnimation: anime.AnimeInstance
	const increaseScore = (enemyType: EnemyType | 'ENEMY_HIT_SCORE', position: {
		x: number,
		y: number
	}) => {
		if (enemyType === 'ENEMY_HIT_SCORE') {
			currentScore += ENEMY_HIT_SCORE
		} else {
			currentScore += killScores[enemyType]
		}

		gameObjects.push(new Score({
			color: player.color,
			fontStyle: localFont,
			score: enemyType === 'ENEMY_HIT_SCORE' ? ENEMY_HIT_SCORE : killScores[enemyType],
			fontSize: enemyType === 'ENEMY_HIT_SCORE' ? 18 : 24,
			ctx,
			position,
		}))

		if (currentScoreIncreasingAnimation) currentScoreIncreasingAnimation.pause()
		currentScoreIncreasingAnimation = anime({
			targets: highScoreElement,
			innerHTML: currentScore,
			round: 1,
			duration: 100,
			easing: 'easeInOutQuad',
		})
	}

	const killEnemy = (enemy: Enemy, isBounty = true) => {
		const particles = enemy.kill(getRandomFromArray(Sounds.enemyDeathSounds), globalVolume)
		// increase score
		const enemyType = getEnemyType(enemy)
		if (enemyType !== undefined && isBounty)
			increaseScore(enemyType, enemy.position)

		addExplosionToGameObjects([particles])
	}

	// lets create the player
	player = new Player({
		canvas,
		ctx,
		position: {
			x: canvas.width / 2,
			y: canvas.height / 2,
		}, radius: 12,
		color: 'white',
		lives: 3,
		onLifeLost: () => {
			healthbar.decrement()
		},
		onDeath: () => {
			playSoundEffect(Sounds.bigExplosionSound2, globalVolume + 0.1)
		}
	})

	playerRigidBody = new CircularRigidBody(player, player.radius)
	gameObjects.push(player)
	rigidBodies.push(playerRigidBody)

	// healthbar
	const barWidth = 25
	const barGap = 10
	const healthBarRightPadding = 10
	healthbar = new Healthbar({
		ctx,
		position: {
			x: canvas.width - ((barWidth + barGap) * player.lives) - healthBarRightPadding,
			y: 20
		}, amount: player.lives,
		color: 'red',
		width: barWidth,
		height: 5,
		barGap: barGap,
		skewAngle: -0.5,
		inactiveColor: 'white',
	})
	gameObjects.push(healthbar)

	// grid
	grid = new Grid({
		ctx,
		color: player.color,
		gapX: 45,
		gapY: 30,
		particleW: 8,
		particleH: 12,
	})

	// audio
	audioContext = new AudioContext()
	audioAnalyser = audioContext.createAnalyser()
	audioAnalyser.fftSize = Math.pow(2, Math.ceil(Math.log2(grid.columnCount))) * 2
	audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount)

	// play looping music
	gameplayLoopAudio = playSoundEffect(Sounds.gameplayLoopSound, globalVolume - globalVolume / 10, true)
	let audioSource = audioContext.createMediaElementSource(gameplayLoopAudio)
	audioSource.connect(audioAnalyser)
	audioAnalyser.connect(audioContext.destination)

	// frameCounter
	const frameCounter = new FrameCounter()

	// add event listeners
	canvas.addEventListener('mousedown', (e) => {
		if (!cursorMouseX || !cursorMouseY) return

		// player shoots
		const { bullet, bulletRigidBody, particles }: {
			bullet: Bullet | null,
			bulletRigidBody: CircularRigidBody | null,
			particles: ExplosionParticle[]
		} = player.shoot({
			shootingCoordinates: {
				x: cursorMouseX,
				y: cursorMouseY,
			},
			soundEffect: Sounds.playerShootSound,
			volume: globalVolume,
		})

		if (bullet && bulletRigidBody) {
			gameObjects.push(bullet)
			rigidBodies.push(bulletRigidBody)
			addExplosionToGameObjects([particles])
		}
	})

	canvas.addEventListener('mousemove', (e) => {
		cursorMouseX = e.clientX
		cursorMouseY = e.clientY
	})

	// animation loop  
	const animation = () => {
		ctx.fillStyle = `rgba(5, 5, 5, 0.5)`
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		cursorRotation += 0.01
		// get audio data
		audioAnalyser.getByteFrequencyData(audioDataArray)
		rangeOfCols = Math.floor(grid.columnCount / eqFactors.colFactor)
		rangeOfRows = Math.floor(grid.rowCount / eqFactors.rowFactor)

		// grid
		for (let i = 0; i < grid.particles.length; i++) {
			const gridParticle = grid.particles[i]

			const particleRowIndex = Math.floor(i / grid.columnCount)
			const particleColumnIndex = i % grid.columnCount
			const inverseParticleRowIndex = grid.rowCount - particleRowIndex - 1

			const searchRadius = 150
			const distance = Math.hypot(player.position.x - gridParticle.position.x, player.position.y - gridParticle.position.y)

			const maxFrequency = 255

			const numberOfRowParticlesToLightUp = Math.floor((audioDataArray[particleColumnIndex > grid.columnCount / 2 ? grid.columnCount - particleColumnIndex : particleColumnIndex] / maxFrequency) * rangeOfRows)

			if (!grid.isFlashing)
				if (distance < searchRadius && player.isAlive) {
					if (distance < searchRadius / 2.5) {
						const threshold = 0.3
						gridParticle.alpha = (distance / searchRadius) - threshold < 0 ? 0 : (distance / searchRadius) - threshold
					} else {
						gridParticle.alpha = 1 - (distance / searchRadius) < gridParticle.initialAlpha ? gridParticle.initialAlpha : 1 - (distance / searchRadius)
					}
				} else {
					gridParticle.alpha = gridParticle.initialAlpha
					// for vertical equalizer
					if (inverseParticleRowIndex < numberOfRowParticlesToLightUp || particleRowIndex < numberOfRowParticlesToLightUp) {
						gridParticle.alpha = eqFactors.equalizerAlpha
					}
				}

			gridParticle.update()
		}

		gameObjects.forEach((gameObject, i) => {
			if (!gameObject.isAlive) {
				gameObjects.splice(i, 1)

				if (gameObject instanceof ExplosionParticle) {
					ExplosionParticle.PARTICLE_COUNT -= 1
				}
			} else {
				gameObject.update()
			}
		})

		rigidBodies.forEach((rigidBody, i) => {
			if (!rigidBody.gameObject.isAlive) {
				rigidBodies.splice(i, 1)
			} else {
				rigidBody.update()

				if (!player.isAlive) return
				// check for collision with player and other enemy
				if ((rigidBody.gameObject instanceof Enemy || (rigidBody.gameObject instanceof Bullet && rigidBody.gameObject.isEnemy))
					&& rigidBody.checkCollision(playerRigidBody)) {
					// player hit by enemy
					// decrease number of lives
					player.decrementLives()
					const collidingGameObject = rigidBody.gameObject

					// add an explosion
					if (collidingGameObject instanceof Bullet) {
						addExplosionToGameObjects(
							[addExplosion({
								ctx,
								position: player.position,
								colors: [collidingGameObject.color],
								startingAngle: collidingGameObject.angle + Math.PI,
								angleSpan: 120 * Math.PI / 180,
								numberOfParticles: 10,
							}),
							addExplosion({
								ctx,
								position: collidingGameObject.position,
								colors: [player.color],
								startingAngle: collidingGameObject.angle,
								angleSpan: 120 * Math.PI / 180,
								numberOfParticles: 20,
							})]
						)

						collidingGameObject.isAlive = false

						// play sound
						playSoundEffect(Sounds.bulletImpactSound, globalVolume)
					} else if (collidingGameObject instanceof Enemy) {

						addExplosionToGameObjects(
							[addExplosion({
								ctx,
								position: player.position,
								colors: [collidingGameObject.color],
								startingAngle: Math.atan2(player.position.y - collidingGameObject.position.y, player.position.x - collidingGameObject.position.x) + Math.PI,
								angleSpan: 120 * Math.PI / 180,
								numberOfParticles: 10,
							})]
						)

						// kill enemy
						killEnemy(collidingGameObject, false)
					}

					// shake screen
					CanvasUtils.blurAndShakeCanvas({
						canvas,
						shake: {
							min: 50,
							max: 100
						},
						zoom: {
							min: 1.01,
							max: 1.05
						},
					})

					grid.flash(playerDamageColor)
				}

				if (rigidBody.gameObject instanceof Bullet && rigidBody.gameObject.isEnemy === false) {
					const bullet = rigidBody.gameObject

					if (bullet.position.x > canvas.width || bullet.position.x < 0 || bullet.position.y > canvas.height || bullet.position.y < 0) {
						bullet.isAlive = false
					}

					rigidBodies.forEach((otherRigidBody, j) => {
						if (otherRigidBody.gameObject instanceof Enemy && rigidBody.checkCollision(otherRigidBody)) {
							// enemy hit
							// increase score
							increaseScore('ENEMY_HIT_SCORE', bullet.position)

							const enemy = otherRigidBody.gameObject
							const enemyRigidBody = otherRigidBody
							// remove bullet
							bullet.isAlive = false

							// add explosion facing the direction of the enemy
							addExplosionToGameObjects(
								[addExplosion({
									ctx,
									position: bullet.position,
									colors: [enemy.color],
									startingAngle: bullet.angle,
									angleSpan: 120 * Math.PI / 180,
									numberOfParticles: 10,
								}),
								addExplosion({
									ctx,
									position: bullet.position,
									colors: [bullet.color],
									startingAngle: bullet.angle + Math.PI,
									angleSpan: 120 * Math.PI / 180,
									numberOfParticles: 10,
								})]
							)

							// add explosion facing the direction of the bullet

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
										CanvasUtils.blurAndShakeCanvas({
											canvas
										})

										// flash grid
										grid.flash(enemy.color, true)
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
							playSoundEffect(Sounds.bulletImpactSound, globalVolume)
						}
					})
				}
			}
		})

		frameCounter.at(1000, () => {
			const { enemy, enemyRigidBody }: {
				enemy: Enemy,
				enemyRigidBody: CircularRigidBody
			} = spawnEnemy({
				ctx,
				canvas,
				playerObject: player,
				spawnPadding: 100,
			})

			gameObjects.push(enemy)
			rigidBodies.push(enemyRigidBody)

			if (enemy instanceof DiamondEnemy) {
				// make a shootingEnemy superclass later
				enemy.setOnShoot(() => {
					const { bullet, bulletRigidBody, particles } = spawnBullet({
						ctx,
						isEnemy: true,
						bulletSpawner: enemy,
						bulletSpeed: 5,
						radius: 4,
						shootingCoordinates: player.position,
						soundEffect: Sounds.enemyShootSound,
						volume: globalVolume,
					})

					gameObjects.push(bullet)
					rigidBodies.push(bulletRigidBody)
					addExplosionToGameObjects([particles])
				})
			}
		})

		frameCounter.incrementFrame()

		drawCursor()
	}

	// finally start the game
	renderLoop(animation)
}

export default initGame