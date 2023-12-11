import anime from "animejs"
import { useEffect, useRef } from "react"
import localFont from "next/font/local"
import playSoundEffect from "../gameFunctions/playSoundEffect"
import { menuOpenBoxSound, menuTextGlitchSound, startGameSound } from "../gameUtils/sounds"

import useGameStore from "../useGameStore"

const titleFont = localFont({ src: '../assets/fonts/Ofarea-Regular.ttf' })

export default () => {
	const setStartGame = useGameStore(state => state.setStartGame)
	const globalVolume = useGameStore(state => state.globalVolume)

	const currentComponentRef = useRef(null)
	const fadingOutRef = useRef<anime.AnimeInstance | null>(null)


	const titleBoxRef = useRef(null)
	const titleTextRef = useRef(null)
	const gunzTextRef = useRef('GUNZ')
	const gunzIndividualLetters: HTMLSpanElement[] = Array.from({ length: gunzTextRef.current.length })

	const handleStartGame = () => {

		// fade the component out
		if (!fadingOutRef.current) {
			playSoundEffect(startGameSound, globalVolume);
			(document.getElementById('my_modal_1') as any)?.close()
			fadingOutRef.current = anime({
				targets: currentComponentRef.current,
				opacity: [1, 0],
				duration: 1000,
				easing: 'easeInOutQuad',
				complete: () => {
					setStartGame(true)
				}
			})
		}
	}

	useEffect(() => {
		let openBoxSound: HTMLAudioElement;

		anime({
			targets: titleBoxRef.current,
			opacity: [0, 1],
			duration: 2000,
			easing: 'easeInOutQuad',
		})

		anime({
			targets: titleBoxRef.current,
			width: ['0px', '600px'],
			height: ['0px', '150px'],
			duration: 1000,
			delay: 1000,
			easing: 'easeOutElastic(1, .6)',
			update: (anim) => {
				if (anim.currentTime > anim.delay && !openBoxSound) {
					openBoxSound = playSoundEffect(menuOpenBoxSound, globalVolume)
				}
			},
			complete: () => {
				const audioSource = playSoundEffect(menuTextGlitchSound, globalVolume)
				for (let i = 0; i < gunzIndividualLetters.length; i++) {
					anime({
						targets: gunzIndividualLetters[i],
						opacity: [0, 1],
						duration: 1000,
						delay: 500 * i,
						easing: 'easeInOutQuad',
						update: (anim) => {
							if (Number(anim.currentTime.toFixed(0)) % 10 === 0) {
								gunzIndividualLetters[i].innerText = String.fromCharCode(Math.floor(Math.random() * 26) + 65)
							}
						},
						complete: () => {
							// reset letters
							gunzIndividualLetters[i].innerText = gunzTextRef.current[i]

							// if last letter, color it red
							if (i === gunzIndividualLetters.length - 1) {
								audioSource.pause()
								anime({
									targets: gunzIndividualLetters[i],
									color: '#ff0000',
									duration: 300,
									delay: 1000,
									easing: 'easeInOutQuad',
								})
							}
						}
					})
				}
			}
		})
	}, [])

	return <>
		<div ref={currentComponentRef} className="flex flex-col items-center">
			<div className="relative w-0 h-0 flex items-center justify-center opacity-0 border-white border-2 m-10 select-none" ref={titleBoxRef}>
				{/* crossshairs */}
				<div className={`absolute border-r-2 border-b-2 border-white top-0 left-0 w-8 h-8 -mt-8 -ml-8`} >
				</div>
				<div className={`absolute border-t-2 border-l-2 border-white bottom-0 right-0 w-8 h-8 -mb-8 -mr-8`} >
				</div>

				{/* text */}
				<span ref={titleTextRef} className={`${titleFont.className} text-8xl font-extrabold`}>
					{
						gunzTextRef.current.split('').map((letter, index) => {
							return <span key={index} className="opacity-0" ref={(ref) => {
								if (ref)
									gunzIndividualLetters[index] = ref
							}}>{letter}</span>
						})
					}
				</span>
			</div>

			<div>
				<button className="border-2 border-white text-white rounded p-4 py-2 transition-all hover:border-red-600 hover:text-red-600
					animate__animated animate__fadeInUp animate__delay-3s"
					onClick={() => (document.getElementById('my_modal_1') as any)?.showModal()}
				>
					Start Game
				</button>
			</div>

			<dialog id="my_modal_1" className={`modal`}>
				<div className="modal-box bg-[#030303] border-white border-2 space-y-4">
					<h2 className={`text-4xl ${titleFont.className}`}>
						KEY MAPS
					</h2>
					<hr />
					<div className="flex gap-4">
						<div className="text-xl whitespace-nowrap">
							<p className="my-2">
								<span className="text-red-600">W</span> - Move Up
							</p>
							<p className="my-2">
								<span className="text-red-600">S</span> - Move Down
							</p>
							<p className="my-2">
								<span className="text-red-600">A</span> - Move Left
							</p>
							<p className="my-2">
								<span className="text-red-600">D</span> - Move Right
							</p>
							<p className="my-2">
								<span className="text-red-600">Left Click</span> - Shoot
							</p>
							<p className="my-2">
								<span className="text-red-600">ESC</span> - Pause Game
							</p>
						</div>
						<div className="divider divider-horizontal">
						</div>
						<div className="text-xl">
							Your <span className="text-red-600">health</span> is on the top left corner.
							<br />
							<br />
							Your <span className="text-red-600">score</span> is on the top right corner.
							<br />
							<br />
							Make sure nothing moves.
						</div>
					</div>
					<div className="flex">
						<button className="mx-auto border-2 border-white text-white rounded p-4 py-2 transition-all hover:border-red-600 hover:text-red-600" onClick={handleStartGame}>
							Lock and load
						</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>Close</button>
				</form>
			</dialog>
		</div>
	</>
}