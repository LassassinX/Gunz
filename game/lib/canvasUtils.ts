import anime from "animejs"
import { randomRange } from "../utils/functions"

export const blurAndShakeCanvas = ({
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
	canvas,
}: {
	blur?: number,
	shake?: {
		min: number,
		max: number
	},
	zoom?: {
		min: number,
		max: number
	},
	duration?: number,
	canvas?: HTMLCanvasElement
} = {}) => {
	if (!canvas)
		return console.error('No canvas provided to blurAndShakeCanvas function')

	let shakeAmount = randomRange(shake.min, shake.max)

	const shakeY = randomRange(-shakeAmount, shakeAmount)
	const shakeX = randomRange(-shakeAmount, shakeAmount)

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

export const drawDiamond = ({ x, y, size, lineWidth, color, ctx, rotation }: {
	x: number,
	y: number,
	size: number,
	lineWidth: number,
	color: string,
	ctx: CanvasRenderingContext2D
	rotation?: number
}) => {
	rotation = Math.PI / 4 + (rotation || 0)
	ctx.save()
	ctx.translate(x, y)
	ctx.rotate(rotation)
	ctx.beginPath()
	ctx.rect(-size / 2, -size / 2, size, size)
	ctx.strokeStyle = color
	ctx.lineWidth = lineWidth
	ctx.stroke()
	ctx.closePath()
	ctx.restore()
}