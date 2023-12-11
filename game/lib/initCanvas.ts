export default (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext('2d');
	const maxWidth = 2600, maxHeight = 1100;

	function setWidthAndHeight() {
		canvas.width = window.innerWidth > maxWidth ? maxWidth : window.innerWidth;;
		canvas.height = window.innerHeight > maxHeight ? maxHeight : window.innerHeight;
	}

	setWidthAndHeight();

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
				setWidthAndHeight()
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
