"use client"
import { useEffect, useMemo, useRef, useState } from 'react';
import MainMenu from './MainMenu'
import { gameplayLoopSound, menuLoopSound } from './gameUtils/sounds';

// @ts-ignore
import { Gapless5, CrossfadeShape } from "@regosen/gapless-5";

import useGameStore from './useGameStore';

import anime from 'animejs';
import Gameplay from './Gameplay';

export default () => {
	const mainContainerRef = useRef(null)

	const startGame = useGameStore(state => state.startGame)
	const globalVolume = useGameStore(state => state.globalVolume)

	const player = useMemo(() => new Gapless5({
		loop: true,
		volume: 0,
		singleMode: true,
		crossfadeShape: CrossfadeShape.EqualPower
	}), [])

	useEffect(() => {

		player.addTrack(menuLoopSound);
		player.play();

		anime({
			targets: player,
			volume: [0, globalVolume],
			duration: 6000,
			easing: 'cubicBezier(1.000, -0.130, 0.730, 1.100)',
		})

		return () => {
			player.stop();
			player.removeAllTracks();
		}
	}, [])

	useEffect(() => {
		if (startGame) {
			player.stop()
		} else {
			player.gotoTrack(0)
		}
	}, [startGame])



	return <>
		<main className={`flex flex-col h-[100svh] justify-center items-center`} ref={mainContainerRef}>
			{startGame ? <Gameplay mainContainerRef={mainContainerRef}/> : <MainMenu />}
		</main>
	</>
}