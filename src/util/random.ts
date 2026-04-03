import { randomInteger } from "remeda";

export const weightedRandom = <T>(data: { weight: number; data: T }[]) => {
	const sum = data.reduce((l, c) => l + c.weight, 0);
	const found = randomInteger(1, sum);
	let acc = 0;
	for (const entry of data) {
		const prev = acc;
		acc += entry.weight;
		if (prev <= found && found <= acc) return entry.data;
	}
};

export const weightedRandomKeys = <T extends string | number | symbol>(data: Record<T, number>) => {
	return weightedRandom(Object.entries(data).map(x => ({ data: x[0], weight: x[1] as number }))) as T;
};

export const sampleRandom = <T>(array: T[]) => array[Math.floor(Math.random() * array.length)];