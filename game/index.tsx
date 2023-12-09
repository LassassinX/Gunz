"use client";
import React, { useEffect, useRef } from 'react';
import localFont from 'next/font/local'

import initCanvas from './lib/initCanvas';
import initGame from './initGame';

const highScoreFont = localFont({ src: './assets/fonts/Ofarea-Regular.ttf' })
const scorePopupFont = localFont({ src: './assets/fonts/RealYoung-6XLM.ttf' })

export default () => {
	const canvasRef = useRef(null)
	const fpsCounterRef = useRef(null)
	const highScoreRef = useRef(null)

	useEffect(() => {
		if (!canvasRef.current) return

		const {
			canvas,
			ctx,
			renderLoop,
			setWidthAndHeight
		} = initCanvas(canvasRef.current)

		setWidthAndHeight(window)

		if (!canvas) return
		if (!ctx) return
		if (!highScoreRef.current) return

		initGame({
			canvas,
			ctx,
			renderLoop,
			setWidthAndHeight,
			highScoreElement: highScoreRef.current as HTMLSpanElement,
			scoreFont: scorePopupFont.style.fontFamily,
		})

		// set fpsCounter
		let frameCount = 0;
		let lastTime: any;

		function updateFPS() {
			if (!fpsCounterRef.current) return

			const now = performance.now();
			const elapsed = now - lastTime;

			if (elapsed >= 1000) {
				const fps = Math.round((frameCount * 1000) / elapsed);
				(fpsCounterRef.current as HTMLDivElement).innerText = 'FPS: ' + fps;

				frameCount = 0;
				lastTime = now;
			}

			frameCount++;

			requestAnimationFrame(updateFPS);
		}

		// Initial setup
		lastTime = performance.now();
		updateFPS();
	}, [])

	return <div className={highScoreFont.className}>
		<div ref={fpsCounterRef} className='fixed text-lg text-white bg-black p-1 rounded pointer-events-none select-none bottom-[10px] right-[10px] z-10'>
		</div>
		<div className='fixed text-lg bg-black opacity-80 rounded p-2 m-4 z-10 pointer-events-none select-none'>
			<span ref={highScoreRef}>
				0
			</span>
		</div>
		<canvas className='cursor-none' ref={canvasRef}>
		</canvas>
	</div>

} 