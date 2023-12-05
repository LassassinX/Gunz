const canvas: HTMLCanvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;

if (!canvas) throw new Error('Canvas not found');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');

if (!ctx) throw new Error('Canvas context not found');

function renderLoop(externalFunction?: Function) {
	if (externalFunction) externalFunction();
	requestAnimationFrame(renderLoop.bind(this, externalFunction));
}

let resizeTimeout: undefined | any = undefined;
window.addEventListener('resize', () => {
	if (!resizeTimeout) {
		resizeTimeout = setTimeout(() => {
			resizeTimeout = undefined;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}, 100);
	}
})

function playSoundEffect(audioSrc: any, volume = 0.1, loop = false) : HTMLAudioElement {
	const audio = new Audio(audioSrc)
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	audio.volume = volume
	audio.loop = loop
	audio.play()

	return audio
}

export { canvas, ctx, renderLoop, playSoundEffect }