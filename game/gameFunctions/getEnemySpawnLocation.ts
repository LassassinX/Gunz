import { randomRange } from "../assets/sounds/utils/functions"

const getEnemySpawnLocation = ({
	canvas,
	objectNotToOverlap,
	spawnPadding
}: { 
	canvas: HTMLCanvasElement,
	objectNotToOverlap: any,
	spawnPadding: number
}): {
	x: number,
	y: number
} => {
	// spawn enemies a region outside of the screen,
	const x = Math.random() > 0.5 ? randomRange(canvas.width, canvas.width + spawnPadding) : randomRange(-spawnPadding, 0)
	const y = Math.random() > 0.5 ? randomRange(canvas.height, canvas.height + spawnPadding) : randomRange(-spawnPadding, 0)

	if (x >= objectNotToOverlap.position.x + objectNotToOverlap.radius && x <= objectNotToOverlap.position.y - objectNotToOverlap.radius && y >= objectNotToOverlap.position.y + objectNotToOverlap.radius && y <= objectNotToOverlap.position.y - objectNotToOverlap.radius) {
		return getEnemySpawnLocation({
			canvas,
			objectNotToOverlap,
			spawnPadding
		})
	}
	return { x, y }
}

export default getEnemySpawnLocation