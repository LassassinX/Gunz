import Image from 'next/image'

import Game from '../game/game'

export default function Home() {
	return (
		<Game />
		// <main className="flex flex-col items-center justify-center h-[100svh]">
		// 	<div className='prose prose-xl dark:prose-invert text-center'> 
		// 		<h1>
		// 			Hello,
		// 		</h1>
		// 		<h2>
		// 			This game was created by <a href='https://github.com/LassassinX'>@SanjidIslamChowdhury</a> with 💖.
		// 		</h2>
		// 		<h2>
		// 			If you like this game, consider buying me a coffee!
		// 		</h2>
		// 		<p>
		// 			Click anywhere to start.
		// 		</p>
		// 	</div>
		// </main>
	)
}
