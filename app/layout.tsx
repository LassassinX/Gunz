import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Preload from '@/game/Preload'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Gunz',
	description: 'A shooter game made using vanillaJs, animejs, and gapless-5. Bundled using NextJs',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {

	return (
		<html lang="en">
			<body className={inter.className + ` overflow-hidden bg-black`}>
				{children}
				<Preload />
			</body>
		</html>
	)
}
