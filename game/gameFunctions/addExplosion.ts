import { randomRange, getRandomFromArray } from "../assets/sounds/utils/functions"
import ExplosionParticle from "../gameClasses/explosionParticle"

export default ({ctx, position, colors, startingAngle = 0, angleSpan = 360 * Math.PI / 180,
	minRadius = 2, maxRadius = 5, minVelocity = 1, maxVelocity = 10,
	numberOfParticles = 25, dampingAmount = 0.97
}: {
	colors: string[],
	position: { x: number, y: number },
	ctx: CanvasRenderingContext2D,
	startingAngle?: number,
	angleSpan?: number,
	minRadius?: number,
	maxRadius?: number,
	minVelocity?: number,
	maxVelocity?: number,
	numberOfParticles?: number,
	dampingAmount?: number
}) => {
	// generate particles between startingAngle and startingAngle + angleSpan
	const endingAngle = startingAngle + angleSpan / 2
	startingAngle = startingAngle - angleSpan / 2
	const particles = []
	for (let i = 0; i < numberOfParticles; i++) {
		const velocity = randomRange(minVelocity, maxVelocity)
		const angle = randomRange(startingAngle, endingAngle)
		const particle = new ExplosionParticle({
			position, 
			radius: randomRange(minRadius, maxRadius), 
			color: getRandomFromArray(colors), 
			velocity: {
				x: Math.cos(angle) * velocity,
				y: Math.sin(angle) * velocity,
			}, 
			dampingAmount: dampingAmount,
			ctx
		})
		particles.push(particle)
	}

	return particles
}
