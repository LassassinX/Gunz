export default (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	function setWidthAndHeight({
		innerWidth,
		innerHeight
	}: {
		innerWidth: number,
		innerHeight: number
	}) {
		canvas.width = innerWidth;
		canvas.height = innerHeight;
	}

	function renderLoop(externalFunction?: Function) {
		if (externalFunction) externalFunction();
		//@ts-ignore
		requestAnimationFrame(renderLoop.bind(<any>this, externalFunction));
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

	return { 
		canvas, 
		ctx, 
		renderLoop, 
		setWidthAndHeight
	}
}
