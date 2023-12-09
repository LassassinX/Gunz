import { getRandomFromArray, randomRange, randomRangeInt } from "../utils/functions"
import { DiamondEnemy, TriangleEnemy, CircleEnemy, SquareEnemy, Enemy } from "../gameClasses/enemy"
import player from "../gameClasses/player"
import { CircularRigidBody, GameObject } from "../lib/smolGame/components"
import getEnemySpawnLocation from "./getEnemySpawnLocation"
import { getRandomColor } from "../gameUtils/colors"
import { enemyShootSound } from "../gameUtils/sounds"

const typeOfEnemies = ['square',]
const enemySpeeds= { 
	diamond: 10,
	triangle: 10,
	circle: 2,
	square: 1
}

// spawn a random enemy
export default ({
	playerObject,
	canvas,
	spawnPadding,
	ctx,
}: { playerObject: GameObject, canvas: HTMLCanvasElement, spawnPadding: number, ctx: CanvasRenderingContext2D }) => {

	const position = getEnemySpawnLocation({
		canvas,
		objectNotToOverlap: playerObject,
		spawnPadding,
	});

	const enemyType = getRandomFromArray(typeOfEnemies) as 'diamond' | 'triangle' | 'circle' | 'square';

	return spawnEnemy({
		gameObjectToPointAt: playerObject,
		canvas,
		position,
		ctx,
		spawnPadding,
		type: enemyType
	})
}

const spawnEnemy = ({ gameObjectToPointAt, canvas, position, ctx, spawnPadding, type}: {
	position: { x: number, y: number },
	gameObjectToPointAt: GameObject,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	spawnPadding: number,
	type: 'diamond' | 'triangle' | 'circle' | 'square'
}) => {
	const speed = enemySpeeds[type];
	// get the angle between the enemy and the middle of the canvas
	let angle = Math.atan2(canvas.height / 2 - position.y, canvas.width / 2 - position.x)
	angle = randomRange(angle - Math.PI / 4, angle + Math.PI / 4)

	let enemy: Enemy, enemyRigidBody: CircularRigidBody;

	switch (type) { 
		case 'diamond': 
			enemy =  new DiamondEnemy({
				position, size: randomRange(15, 25), color: getRandomColor(), velocity: {
					x: speed * Math.cos(angle),
					y: speed * Math.sin(angle),
				}, rotation: angle,
				objectToPointAt: gameObjectToPointAt,
				canvas: canvas,
				ctx: ctx,
				enemySpawnPadding: spawnPadding,
			})

			enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
			return {enemy, enemyRigidBody}
			
		case 'triangle':
			enemy = new TriangleEnemy({
				position, size: randomRange(15, 25), color: getRandomColor(), velocity: {
					x: speed * Math.cos(angle),
					y: speed * Math.sin(angle),
				}, rotation: angle,
				objectToPointAt: gameObjectToPointAt,
				canvas: canvas,
				ctx: ctx,
				searchPadding: spawnPadding,
			})

			enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
			return {enemy, enemyRigidBody}

		case 'circle':
			enemy = new CircleEnemy({
				position, size: randomRange(20, 35), color: getRandomColor(), objectToFollow: gameObjectToPointAt,
				velocity: {
					x: speed,
					y: speed,
				},
				canvas,
				ctx,
				enemySpawnPadding: spawnPadding,
			})

			enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
			return {enemy, enemyRigidBody}

		case 'square':
			enemy = new SquareEnemy({
				position, size: randomRangeInt(75, 150), color: getRandomColor(), velocity: {
					x: speed * Math.cos(angle),
					y: speed * Math.sin(angle)
				},
				canvas: canvas,
				ctx: ctx,
				enemySpawnPadding: spawnPadding,
			})

			enemyRigidBody = new CircularRigidBody(enemy, enemy.size)
			return {enemy, enemyRigidBody}

		default:
			throw new Error(`Unknown enemy type: ${type}`);

	}
}
