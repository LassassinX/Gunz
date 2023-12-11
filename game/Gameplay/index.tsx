"use client";
import React, { useEffect, useRef } from 'react';
import localFont from 'next/font/local'

import initCanvas from '../lib/initCanvas';
import initGame from './initGame';
import useGameStore from '../useGameStore';

const highScoreFont = localFont({ src: '../assets/fonts/Ofarea-Regular.ttf' })
const scorePopupFont = localFont({ src: '../assets/fonts/RealYoung-6XLM.ttf' })

export default ({ mainContainerRef }: { mainContainerRef: any }) => {
	const [_, setDummyState] = React.useState(0)

	const globalVolume = useGameStore(state => state.globalVolume)

	const canvasRef = useRef(null)
	const fpsCounterRef = useRef(null)
	const highScoreRef = useRef(null)

	useEffect(() => {
		if (!canvasRef.current) return

		const {
			canvas,
			ctx,
			renderLoop,
		} = initCanvas(canvasRef.current)

		if (!canvas) return
		if (!ctx) return
		if (!highScoreRef.current) return
		if (!mainContainerRef.current) return

		const cleanup = initGame({
			canvas,
			ctx,
			renderLoop,
			globalVolume,
			mainContainerElement: mainContainerRef.current,
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

		return () => {
			cleanup()
		}
		  
	}, [_])
	const restartGame = () => { 
		// @ts-ignore
		document.getElementById('my_modal_1')?.close()

		setDummyState((state) => state + 1)
	}


	return <>
		<div className={highScoreFont.className}>
			<div ref={fpsCounterRef} className='fixed text-lg text-white bg-black p-1 rounded pointer-events-none select-none bottom-[10px] right-[10px] z-10'>
			</div>
			<div className='fixed text-lg bg-black opacity-80 rounded p-2 m-4 z-10 pointer-events-none select-none'>
				<span ref={highScoreRef}>
					0
				</span>
			</div>
			<canvas className='cursor-none' ref={canvasRef}></canvas>
		</div>

		<dialog id="my_modal_1" className="modal">
			<div className={`modal-box max-w-3xl bg-[#030303] border-white border-2 space-y-6 text-center ${highScoreFont.className}`}>
				<h3 className={`font-bold text-4xl whitespace-nowrap`}>You Have <span className='text-red-600'>PERISHED</span></h3>
				<div className={`flex justify-center text-3xl font-extrabold`}>Highscore <span className='divider divider-horizontal'></span> <span className='text-red-600' id='highScore'></span></div>
				{/* <div> */}
					{/* <input type="text" placeholder="Be remembered by..." className="input input-bordered w-full bg-black max-w-xs" /> */}
				{/* </div> */}
				
				<form method="dialog" className="flex justify-center gap-2">
					{/* <button className="border-2 border-white text-white rounded p-4 py-2 transition-all hover:border-red-600 hover:text-red-600">Submit Score</button> */}
					<button className="border-2 border-white text-white rounded p-4 py-2 transition-all hover:border-red-600 hover:text-red-600" onClick={restartGame}>Retry</button>
				</form>
			</div>
		</dialog>
	</>


} 