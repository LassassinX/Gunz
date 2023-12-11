// make a zustand store for the game
import { create } from 'zustand'
interface GameStoreState {
	startGame: boolean,
	setStartGame: (startGame: boolean) => void,
	globalVolume: number,
	setGlobalVolume: (globalVolume: number) => void,

	playerIsDead: boolean,
	setPlayerIsDead: (playerIsDead: boolean) => void,
}


const useGameStore = create<GameStoreState>()((set) => ({
	startGame: false,
	setStartGame: (startGame) => set({ startGame }),
	globalVolume: 0.5,
	setGlobalVolume: (globalVolume) => set({ globalVolume }),

	playerIsDead: false,
	setPlayerIsDead: (playerIsDead) => set({ playerIsDead }),
}))


export default useGameStore
