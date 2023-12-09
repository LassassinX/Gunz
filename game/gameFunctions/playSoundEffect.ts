export default (audioSrc: string, volume = 0.1, loop = false): HTMLAudioElement => {
	const audio = new Audio(audioSrc)
	if (volume > 1) volume = 1
	if (volume < 0) volume = 0
	audio.volume = volume
	audio.loop = loop
	audio.play()

	return audio
}
