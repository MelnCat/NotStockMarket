import * as R from "remeda";
import { pceLink, weightedRandom, weightedRandomKeys } from "./util";
import { z } from "zod";
import offsets from "./catOffsets.json";
import { regex } from "regex";
import { failure, success } from "./result";

const speciesType = z.enum(["C", "M"]);
const windType = z.enum(["O", "N", "S"]);
const furType = z.enum(["S", "L"]);
const colorType = z.enum(["B", "O"]);
const dilutionType = z.enum(["F", "D"]);
const density = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const patternType = z.enum(["Y", "N"]);
const spottingType = z.enum(["T", "M", "S", "P"]);
const whiteType = z.enum(["Y", "N"]);
const whiteNumberType = z.union([
	z.literal(0),
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
	z.literal(6),
	z.literal(7),
	z.literal(8),
	z.literal(9),
	z.literal(10),
]);
const whitePatternType = z.enum(["C", "P", "L", "R", "I"]);
const accentType = z.enum(["B", "L", "R", "Y"]);
const growthType = z.enum(["A", "B", "C"]);
const unknownType = z.literal("?");

const optional = <T>(type: z.ZodType<T>) => {
	return z.union([type, z.literal("?")]);
};

export const catGeneSchema = z.object({
	species: speciesType,
	wind: z.tuple([windType, windType]),
	fur: z.tuple([furType, furType]),
	color: z.tuple([colorType, colorType]),
	dilution: z.tuple([dilutionType, dilutionType]),
	density: density,
	pattern: z.tuple([patternType, patternType]),
	spotting: z.tuple([spottingType, spottingType]),
	white: z.tuple([whiteType, whiteType]),
	whiteNumber: whiteNumberType,
	whiteType: whitePatternType,
	accent: z.tuple([accentType, accentType]),
	growth: z.tuple([growthType, growthType]),
});

export type CatGene = z.TypeOf<typeof catGeneSchema>;

const coloredPartialCatGeneSchema = catGeneSchema.extend({
	wind: z.tuple([windType, z.union([windType, unknownType])]),
	fur: z.tuple([furType, optional(furType)]),
	pattern: z.tuple([patternType, optional(patternType)]),
	white: z.tuple([whiteType, optional(whiteType)]),
	whiteNumber: optional(whiteNumberType),
	whiteType: optional(whitePatternType),
	growth: z.tuple([optional(growthType), optional(growthType)]),
	accent: z.tuple([optional(accentType), optional(accentType)]),
});

export const partialCatGeneSchema = z.union([
	coloredPartialCatGeneSchema,
	coloredPartialCatGeneSchema.extend({
		color: z.tuple([unknownType, unknownType]),
		dilution: z.tuple([unknownType, unknownType]),
		density: unknownType,
		wind: z.tuple([z.literal("O"), z.literal("O")]),
	}),
]);

export type ColoredPartialCatGene = z.TypeOf<typeof coloredPartialCatGeneSchema>;
export type PartialCatGene = z.TypeOf<typeof partialCatGeneSchema>;

export const randomCatGene = (species: "C" | "M" = "C"): CatGene => {
	const firstWind = weightedRandomKeys({
		O: 14,
		N: 43,
		S: 43,
	});
	const secondWind = weightedRandomKeys({
		O: 14,
		N: 43,
		S: 43,
	});
	const firstFur = weightedRandomKeys({
		S: 50,
		L: 50,
	});
	const secondFur = weightedRandomKeys({
		S: 50,
		L: 50,
	});
	const firstColor = weightedRandomKeys({
		B: 50,
		O: 50,
	});
	const secondColor = weightedRandomKeys({
		B: 50,
		O: 50,
	});
	const firstDilution = weightedRandomKeys({
		F: 50,
		D: 50,
	});
	const secondDilution = weightedRandomKeys({
		F: 50,
		D: 50,
	});
	const density = +weightedRandomKeys({
		1: 10,
		2: 20,
		3: 40,
		4: 30,
	});

	const firstPattern = weightedRandomKeys({
		Y: 80,
		N: 20,
	});
	const secondPattern = weightedRandomKeys({
		Y: 80,
		N: 20,
	});
	const firstSpotting = weightedRandomKeys({
		T: 50,
		M: 20,
		S: 25,
		P: 5,
	});
	const secondSpotting = weightedRandomKeys({
		T: 50,
		M: 20,
		S: 25,
		P: 5,
	});

	const firstWhite = weightedRandomKeys({
		Y: 50,
		N: 50,
	});
	const secondWhite = weightedRandomKeys({
		Y: 50,
		N: 50,
	});
	// i now realize that all of the weightings are slightly off by 1%
	const whiteNumber = +weightedRandomKeys({
		0: 1,
		1: 20,
		2: 20,
		3: 15,
		4: 10,
		5: 10,
		6: 10,
		7: 5,
		8: 5,
		9: 3,
		10: 1,
	});
	const whiteType = weightedRandomKeys({
		I: 10,
		R: 20,
		L: 20,
		P: 65,
		C: 85,
	});

	// growth values experimentally found
	const firstGrowth = weightedRandomKeys({
		A: 30,
		B: 50,
		C: 20,
	});
	const secondGrowth = weightedRandomKeys({
		A: 30,
		B: 50,
		C: 20,
	});
	// accent values experimentally found
	const firstAccent = weightedRandomKeys({
		R: 21,
		B: 41,
		L: 31,
		Y: 7,
	});
	const secondAccent = weightedRandomKeys({
		R: 21,
		B: 41,
		L: 31,
		Y: 7,
	});
	return {
		species,
		wind: [firstWind, secondWind],
		fur: [firstFur, secondFur],
		color: [firstColor, secondColor],
		dilution: [firstDilution, secondDilution],
		density: density as 1 | 2 | 3 | 4,
		pattern: [firstPattern, secondPattern],
		spotting: [firstSpotting, secondSpotting],
		white: [firstWhite, secondWhite],
		whiteNumber: whiteNumber as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
		whiteType,
		accent: [firstAccent, secondAccent],
		growth: [firstGrowth, secondGrowth],
	};
};

const catColors: Record<z.TypeOf<typeof colorType>, Record<z.TypeOf<typeof dilutionType>, Record<number, string>>> = {
	B: { F: { 4: "black", 3: "choco", 2: "brown", 1: "tan", 0: "snow" }, D: { 4: "charc", 3: "grey", 2: "smoke", 1: "silver", 0: "snow" } },
	O: { F: { 4: "red", 3: "orange", 2: "ginger", 1: "aprico", 0: "snow" }, D: { 4: "buff", 3: "cream", 2: "almond", 1: "beige", 0: "snow" } },
};

const catPatterns: Record<z.TypeOf<typeof spottingType>, Record<z.TypeOf<typeof spottingType>, string>> = {
	T: { T: "mackerel", M: "classic", S: "broken", P: "lynxpoint" },
	M: { T: "classic", M: "clouded", S: "rosette", P: "cloudpoint" },
	S: { T: "broken", M: "rosette", S: "spotted", P: "mink" },
	P: { T: "lynxpoint", M: "cloudpoint", S: "mink", P: "colorpoint" },
};

const whiteTypes: Record<z.TypeOf<typeof whitePatternType>, string> = {
	I: "inverse",
	R: "right",
	L: "left",
	P: "piebald",
	C: "classic",
};

const accents: Record<z.TypeOf<typeof accentType>, Record<z.TypeOf<typeof accentType>, string>> = {
	B: { B: "blue", L: "indigo", R: "violet", Y: "green" },
	L: { B: "indigo", L: "black", R: "pink", Y: "teal" },
	R: { B: "violet", L: "pink", R: "ruby", Y: "amber" },
	Y: { B: "green", L: "teal", R: "amber", Y: "gold" },
}

export const randomCatTexture = (species: "C" | "M" = "C") => {
	const age = weightedRandomKeys({
		adult: 7,
		kitten: 2,
		bean: 1,
	});

	const pose = weightedRandomKeys({
		upsidedown: 10,
		playing: 20,
		sleeping: 20,
		standing: 25,
		sitting: 25,
	});

	const eyes = weightedRandomKeys({
		squint: 10,
		sleepy: 10,
		uwu: 10,
		content: 10,
		danger: 10,
		sad: 10,
		stern: 10,
		right: 10,
		left: 10,
		neutral: 110,
	});
	return textureFromGene(age, pose, eyes, randomCatGene(species));
};

export const textureFromGene = (
	age: "adult" | "kitten" | "bean",
	pose: "upsidedown" | "playing" | "sleeping" | "standing" | "sitting",
	eyes: "squint" | "sleepy" | "uwu" | "content" | "danger" | "sad" | "stern" | "right" | "left" | "neutral",
	gene: PartialCatGene
) => {
	const wind = (() => {
		if ((gene.wind[0] === "O" && gene.wind[1] === "?") || gene.wind.every(x => x === "O")) return "Null";
		if (gene.wind.every(x => x === "N" || x === "S") && gene.wind[0] !== gene.wind[1]) return "Trade";
		const found = gene.wind.find(x => x === "N" || x === "S")!;
		if (found === "N") return "North";
		return "South";
	})();

	const fur = gene.fur.includes("S") ? "shorthair" : "longhair";

	const mainColor = (() => {
		if (wind === "Null") return "snow";
		const g = gene as ColoredPartialCatGene;
		const dilution = g.dilution.includes("F") ? "F" : "D";
		if (wind === "North" || wind === "Trade") return catColors[g.color[0]][dilution][g.density];
		else return catColors[g.color[1]][dilution][g.density];
	})();
	const tradeColor = (() => {
		if (wind !== "Trade") return null;
		const g = gene as ColoredPartialCatGene;
		const dilution = g.dilution.includes("F") ? "F" : "D";
		if (g.color[0] === g.color[1]) return catColors[g.color[0]][dilution][g.density - 1];
		else return catColors[g.color[1]][dilution][g.density];
	})();

	const pattern = (() => {
		if (!gene.pattern.includes("Y")) return "solid";
		return catPatterns[gene.spotting[0]][gene.spotting[1]];
	})();

	const accent = (() => {
		if (gene.accent.every(x => x === "?")) return "black";
		if (gene.accent[0] === "?") return accents[gene.accent[1] as "L"][gene.accent[1] as "L"];
		else if (gene.accent[1] === "?")return accents[gene.accent[0] as "L"][gene.accent[0] as "L"];
		return accents[gene.accent[0]][gene.accent[1]]
	})();

	const whiteType = gene.whiteType === "?" ? "C" : whiteTypes[gene.whiteType];
	const whiteNumber = gene.white.some(x => x === "Y") ? gene.whiteNumber : 0;

	const images: string[] = [];
	const species = gene.species.toLowerCase() as "c" | "m";
	if (whiteNumber !== 10 && whiteNumber !== "?") images.push(`images/cats/${species}/${mainColor}_main_${pattern}.png`);
	if (tradeColor !== null) images.push(`images/cats/${species}/${tradeColor}_trade_${pattern}.png`);
	if (whiteNumber !== 0) images.push(`images/cats/${species}/white_${whiteType}_${whiteNumber === "?" ? 10 : whiteNumber}.png`);
	if (species === "m") images.push(`images/cats/${species}/${accent}_accent_${pattern}.png`)
	images.push(`images/cats/eyes_${eyes}${whiteNumber === 10 ? `_a_${whiteType}` : ""}.png`);

	return { images: images.map(x => pceLink(x)), offset: offsets[species][age][fur][pose] };
};

export const serializeCatGene = (gene: PartialCatGene, formatted: boolean = false) => {
	const components = [
		gene.species,
		gene.wind,
		gene.fur,
		[...gene.color, ...gene.dilution, gene.density],
		[...gene.pattern, ...gene.spotting],
		[...gene.white, gene.whiteNumber, gene.whiteType],
		gene.growth,
		gene.accent,
	].map(x => (x instanceof Array ? x.join("") : x));

	if (formatted) return components.map(x => `[${x}]`).join(" ");
	return components.join("");
};

const geneRegex = regex`
	\[\s*?(?<species>[CM])\s*\]?\s*
	\[\s*?(?<wind>[NSO?]{2})\s*\]?\s*
	\[\s*?(?<fur>[SL?]{2})\s*\]?\s*
	\[\s*?(?<color>[BO?]{2})(?<dilution>[FD?]{2})(?<density>[1234?])\s*\]?\s*
	\[\s*?(?<pattern>[YN?]{2})(?<spotting>[TMSP]{2})\s*\]?\s*
	\[\s*?(?<white>[YN?]{2})(?<whiteNumber>[0123456789?]|10)(?<whitePattern>[CPLRI])\s*\]?\s*
	\[\s*?(?<growth>[ABC?]{2})\s*\]?\s*
	\[\s*?(?<accent>[BLRY?]{2})\s*\]?
`;

export const deserializeCatGene = (text: string) => {
	const parsed = text.match(geneRegex);
	if (!parsed?.groups) return failure(`Invalid gene "${text}"`);
	const g = parsed.groups;
	const data = partialCatGeneSchema.safeParse({
		species: g.species,
		wind: g.wind.split(""),
		fur: g.fur.split(""),
		color: g.color.split(""),
		dilution: g.dilution.split(""),
		density: isNaN(+g.density) ? g.density : +g.density,
		pattern: g.pattern.split(""),
		spotting: g.spotting.split(""),
		white: g.white.split(""),
		whiteNumber: isNaN(+g.whiteNumber) ? g.whiteNumber : +g.whiteNumber,
		whiteType: g.whitePattern,
		accent: g.accent.split(""),
		growth: g.growth.split(""),
	});
	if (data.error) return failure(data.error.message);
	return success(data.data);
};
