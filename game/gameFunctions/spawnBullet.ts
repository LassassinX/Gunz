import anime from "animejs";
import { CircularRigidBody, DrawableGameObject } from "../lib/smolGame/components";
import Bullet from "../gameClasses/bullet";
import ParticleObject from "../gameClasses/particleObject";
import Player from "../gameClasses/player";
import addExplosion from "./addExplosion";
import playSoundEffect from "./playSoundEffect";

export default function ({ bulletSpawner,
	shootingCoordinates,
	isEnemy,
	bulletSpeed,
	radius,
	ctx,
	useHueShift: useHue = false,
	soundEffect,
	volume: volumne
}: {
	bulletSpawner: ParticleObject & DrawableGameObject, shootingCoordinates: {
		x: number,
		y: number,
	}, bulletSpeed: number, ctx: CanvasRenderingContext2D, isEnemy: boolean, useHueShift?: boolean, radius: number, soundEffect: string, volume: number
}) {
	const angle = Math.atan2(shootingCoordinates.y - bulletSpawner.position.y, shootingCoordinates.x - bulletSpawner.position.x)
	const bullet = new Bullet({
		angle,
		color: useHue ? `hsl(${Bullet.BULLET_HUE}, 100%, 50%)` : bulletSpawner.color,
		ctx,
		isEnemy: isEnemy,
		velocity: {
			x: bulletSpeed,
			y: bulletSpeed
		},
		position: bulletSpawner.position,
		radius: radius,
	})
	const bulletRigidBody = new CircularRigidBody(bullet, bullet.radius)

	// add recoil
	bulletSpawner.velocity.x -= Math.cos(angle) * 0.5
	bulletSpawner.velocity.y -= Math.sin(angle) * 0.5

	// play sound
	playSoundEffect(soundEffect, volumne)

	// add explosion
	const particles = addExplosion({
		position: bulletSpawner.position,
		colors: [bullet.color],
		startingAngle: bullet.angle,
		angleSpan: 90 * Math.PI / 180,
		minRadius: 2,
		maxRadius: 3,
		minVelocity: 4 + Math.hypot(bulletSpawner.velocity.x, bulletSpawner.velocity.y),
		maxVelocity: 4 + Math.hypot(bulletSpawner.velocity.x, bulletSpawner.velocity.y),
		dampingAmount: 0.98,
		numberOfParticles: 7,
		ctx
	})

	anime({
		targets: bullet,
		color: useHue ? `hsl(${Bullet.BULLET_HUE + 10}, 100%, 50%)` : bulletSpawner.color,
		duration: 100,
		easing: 'easeInOutQuad',
		update: () => {
			if (useHue) {
				bulletSpawner instanceof Player ? bulletSpawner.strokeColor = bullet.color : bulletSpawner.color = bullet.color
			}
		},
		complete: () => {
			Bullet.BULLET_HUE = (Bullet.BULLET_HUE + 10) % 360
		}
	})

	return { bullet, bulletRigidBody, particles }
}
