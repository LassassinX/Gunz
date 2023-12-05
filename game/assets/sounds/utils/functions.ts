export function clamp(x: number, min: number, max: number) {
	return Math.min(Math.max(x, min), max);
}

export function randomRange(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function randomRangeInt(min: number, max: number) {
	return Math.floor(randomRange(min, max));
}

export function getRandomFromArray<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

