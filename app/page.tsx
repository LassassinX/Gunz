"use client"
import 'animate.css';
import Game from '../game'
import 'animate.css';

import { useState } from 'react'

export default function Home() {
	const [initGame, setInitGame] = useState(false)

	return (
		initGame ? <Game /> : <main className="flex flex-col items-center justify-center h-[100svh]" onClick={() => { setInitGame(true) }}>
			<div className='rose prose-xl dark:prose-invert text-center'>
				<h1 className='animate__animated animate__fadeInUp'>
					Hello
				</h1>
				<h2 className='animate__animated animate__fadeInUp animate__delay-1s'>
					This game was created by <a className='text-red-600 cursor-pointer' onClick={
						(e) => {
							e.preventDefault()
							e.stopPropagation()
							window.open(`https://github.com/LassassinX`)
						}
					}>@SanjidIslamChowdhury</a> with 💖
				</h2>
				<h2 className='animate__animated animate__fadeInUp animate__delay-2s'>
					If you like this game, consider buying me a coffee!
				</h2>
				<p className='animate__animated animate__fadeInUp animate__delay-3s text-red-600'>
					Click anywhere to start
				</p>
			</div>
		</main>
	)
}
