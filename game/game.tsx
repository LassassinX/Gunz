"use-client";
import React from 'react';

import { canvas, ctx, renderLoop, playSoundEffect } from './lib/initCanvas';
import { GameObject, CircularRigidBody } from './lib/smolGame/components';
import { randomRange, getRandomFromArray, randomRangeInt } from './assets/sounds/utils/functions';
import anime from 'animejs/lib/anime.es.js';

import spawnBullet from './gameFunctions/spawnBullet';
import getEnemySpawnLocation from './gameFunctions/getEnemySpawnLocation';
import Bullet from './gameClasses/bullet';
import { DiamondEnemy, TriangleEnemy, CircleEnemy, SquareEnemy, Enemy } from './gameClasses/enemy';
import ExplosionParticle from './gameClasses/explosionParticle';
import Grid from './gameClasses/grid';
import Healthbar from './gameClasses/healthbar';
import Player from './gameClasses/player';
import addExplosion from './gameFunctions/addExplosion';
import FrameCounter from './gameClasses/frameCounter';
import spawnEnemy from './gameFunctions/spawnEnemy';
import { bigExplosionSound2, playerShootSound, bulletImpactSound } from './gameUtils/sounds';
import { drawDiamond, blurAndShakeCanvas } from './lib/canvasUtils';


if (!canvas)
	throw new Error('Canvas not found')

if (!ctx)
	throw new Error('Context not found')

const globalVolume = 1


let gridFlashing = false

let particleCount = 0
let maxParticleCount = 100

const drawCursor = () => {
	drawDiamond(cursorMouseX, cursorMouseY, 30, 2, player.strokeColor)
	drawDiamond(cursorMouseX, cursorMouseY, 15, 1.5, player.strokeColor)
}


const frameCounter = new FrameCounter()

const gameObjects = []
const rigidBodies = []
const grid = {
	particles: [],
	rows: 0,
	columns: 0
}

const player = new Player({
	canvas,
	ctx,
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

document.addEventListener('mousedown', (e) => {
	const mouseX = e.clientX
	const mouseY = e.clientY

	player.shoot({
		shootingCoordinates: {
			x: mouseX,
			y: mouseY
		},
		soundEffect: playerShootSound,
		volume: globalVolume
	})
})


const barWidth = 25
const barGap = 10
const healthBarRightPadding = 10
const healthBar = new Healthbar({
	position: {
		x: canvas.width - ((barWidth + barGap) * player.lives) - healthBarRightPadding,
		y: 20
	}, amount: player.lives,
	color: 'red',
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

		const numberOfRowParticlesToLightUp = Math.floor((audioDataArray[particleColumnIndex > grid.columns / 2 ? grid.columns - particleColumnIndex : particleColumnIndex] / maxFrequency) * rangeOfRows)

		debugger
		const numberOfColParticlesToLightUp = Math.floor((audioDataArray[particleRowIndex > grid.rows / 2 ? grid.rows - particleRowIndex : particleRowIndex] / maxFrequency) * rangeOfCols)

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

export default () => {


	return (
		<canvas id="game-canvas">
		</canvas>
	)
}