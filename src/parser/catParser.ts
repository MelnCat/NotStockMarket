import { failure, Result, success } from "@/util/result";
import { Cat, Season } from "@prisma/client";
import { HTML2BBCode } from "html2bbcode";
import { JSDOM } from "jsdom";
import { chunk } from "remeda";

export type RawCat = Omit<Cat, "trinketId" | "clothing"> & { trinketName: string | null; clothingKeys: string[] };

export const parseCatPage = (content: string): Result<RawCat> => {
	const dom = new JSDOM(content);
	const doc = dom.window.document;
	const form = doc.querySelector(".forum-post-group");
	if (!form) return failure("Invalid page layout");
	const builder = {} as Partial<RawCat>;
	const title = doc.querySelector(".cat-title b")?.textContent;
	if (!title) return failure("Invalid title");
	builder.name = title;
	const columns = [...form.querySelectorAll(".bio-group-column")];
	const findColumn = (text: string) =>
		columns
			.find(x => x.children[0]?.textContent?.startsWith(text))
			?.querySelector(".bio-group-end")
			?.textContent?.trim();
	const birthdayText = findColumn("Birthday");
	if (!birthdayText) return failure("Missing birthday");
	const birthdayComponents = birthdayText.match(/(\w+) (\d+), Year (\d+)/);
	if (
		!birthdayComponents?.[1] ||
		!birthdayComponents?.[2] ||
		!birthdayComponents?.[3] ||
		!(birthdayComponents?.[1]?.toUpperCase() in Season) ||
		isNaN(+birthdayComponents?.[2]) ||
		isNaN(+birthdayComponents?.[3])
	)
		return failure("Birthday text missing or invalid");
	builder.birthYear = +birthdayComponents?.[3];
	builder.birthSeason = Season[birthdayComponents?.[1]?.toUpperCase() as keyof typeof Season];
	builder.birthDay = +birthdayComponents?.[2];

	const wind = findColumn("Wind");
	if (!wind) return failure("Missing wind");
	builder.wind = wind;

	const pronouns = findColumn("Pronouns");
	if (!pronouns) return failure("Missing pronouns");
	builder.pronouns = pronouns;

	const origin = findColumn("Origin");
	if (!origin) return failure("Missing origin");
	builder.origin = origin;

	const id = findColumn("ID Code")?.match(/\[cat=(\d+)\]/)?.[1];
	if (!id || isNaN(+id)) return failure("ID missing or invalid");
	builder.id = +id;

	const species = findColumn("Species");
	if (!species) return failure("Species missing");
	builder.species = species;

	const size = findColumn("Size")?.match(/([\d.]+) lbs\. \/ ([\d.]+) kg/);
	if (!size?.[1] || !size?.[2] || isNaN(+size?.[1]) || isNaN(+size?.[2])) return failure("Size missing or invalid");
	builder.sizeLb = +size?.[1];
	builder.sizeKg = +size?.[2];

	const fur = findColumn("Fur");
	if (!fur) return failure("Fur missing");
	builder.fur = fur;

	const color = findColumn("Color");
	if (!color) return failure("Color missing");
	builder.color = color;

	const pattern = findColumn("Pattern");
	if (!pattern) return failure("Pattern missing");
	builder.pattern = pattern;

	const whiteMarks = findColumn("White Marks");
	if (!whiteMarks) return failure("White marks missing");
	builder.whiteMarks = whiteMarks;

	const eyeColor = findColumn("Eye Color");
	if (!eyeColor) return failure("Eye color missing");
	builder.eyeColor = eyeColor;

	const bravery = findColumn("Bravery");
	if (!bravery || isNaN(+bravery)) return failure("Bravery missing");
	builder.bravery = +bravery;

	const benevolence = findColumn("Benevolence");
	if (!benevolence || isNaN(+benevolence)) return failure("Benevolence missing");
	builder.benevolence = +benevolence;

	const energy = findColumn("Energy");
	if (!energy || isNaN(+energy)) return failure("Energy missing");
	builder.energy = +energy;

	const extroversion = findColumn("Extroversion");
	if (!extroversion || isNaN(+extroversion)) return failure("Extroversion missing");
	builder.extroversion = +extroversion;

	const dedication = findColumn("Dedication");
	if (!dedication || isNaN(+dedication)) return failure("Dedication missing");
	builder.dedication = +dedication;
	const jobLoop = [...form.querySelectorAll(".cat-title-loop")].find(x => x.firstChild?.textContent?.startsWith("Day Job"));
	if (!jobLoop) return failure("Job loop missing");
	const job = jobLoop.childNodes[1]?.textContent?.match(/[\w ]+/)?.[0]?.trim();
	if (!job) return failure("Job missing or invalid");
	builder.job = job;
	const jobCol = jobLoop.querySelector(".bio-group-column");
	if (!jobCol) return failure("Job column missing or invalid");
	const toNumberOrUndefined = (str: string | undefined) => (str === undefined ? undefined : +str);
	const jobXp = [...jobCol.childNodes]
		.filter(x => x.nodeType === x.TEXT_NODE)
		.map(
			x =>
				[
					x.textContent?.match(/(.+?) Level/)?.[1],
					{
						level: toNumberOrUndefined(x.textContent?.match(/Level (\d+)/)?.[1]),
						xp: x.textContent?.includes("Maximum Level") ? 0 : toNumberOrUndefined(x.textContent?.match(/(\d+)\/\d+ EXP/)?.[1]),
					},
				] as const
		);
	if (jobXp.some(x => x[0] === undefined || x[1].level === undefined || x[1].xp === undefined)) return failure("Job xp invalid");
	builder.jobXp = Object.fromEntries(jobXp);

	const classLoop = [...form.querySelectorAll(".cat-title-loop")].find(x => x.firstChild?.textContent?.startsWith("Adventuring Class"));
	if (!classLoop) return failure("Class loop not found")
	const clazz = classLoop?.childNodes[1]?.textContent?.match(/[\w ]+/)?.[0]?.trim();
	if (!clazz) return failure("Class missing or invalid");
	builder.class = clazz;
	const classCol = classLoop.querySelector(".bio-group-column");
	if (!classCol) return failure("class column missing or invalid");
	const classXp = [...classCol.childNodes]
		.filter(x => x.nodeType === x.TEXT_NODE)
		.map(
			x =>
				[
					x.textContent?.match(/(.+) Level/)?.[1],
					{
						level: toNumberOrUndefined(x.textContent?.match(/Level (\d+)/)?.[1]),
						xp: x.textContent?.includes("Maximum Level") ? 0 : toNumberOrUndefined(x.textContent?.match(/(\d+)\/\d+ EXP/)?.[1]),
					},
				] as const
		);
	if (classXp.some(x => x[0] === undefined || x[1].level === undefined || x[1].xp === undefined)) return failure("Job xp invalid");
	builder.classXp = Object.fromEntries(classXp);
	// todo check if city
	const getStat = (id: string) => {
		const content = form.querySelector(`#base-stats #${id}-num`)?.textContent;
		if (!content || isNaN(+content)) return null;
		return +content;
	};
	const strength = getStat("str");
	if (!strength) return failure("Strength missing or invalid");
	builder.strength = strength;

	const agility = getStat("agi");
	if (!agility) return failure("Agility missing or invalid");
	builder.agility = agility;

	const health = getStat("hlth");
	if (!health) return failure("Health missing or invalid");
	builder.health = health;

	const finesse = getStat("fin");
	if (!finesse) return failure("Finesse missing or invalid");
	builder.finesse = finesse;

	const cleverness = getStat("clev");
	if (!cleverness) return failure("Cleverness missing or invalid");
	builder.cleverness = cleverness;

	const perception = getStat("per");
	if (!perception) return failure("Perception missing or invalid");
	builder.perception = perception;

	const luck = getStat("luck");
	if (!luck) return failure("Luck missing or invalid");
	builder.luck = luck;

	const centerMessage = doc.querySelector(".formlike-content-area.center")?.textContent;
	builder.travelling = centerMessage?.includes("is currently out travel") ?? false;

	const location = doc.querySelector(".location-text")?.textContent?.replaceAll("★", "").trim();
	if (!location) return failure("Location missing");
	builder.location = location;

	const genetic = form.querySelector(".genes-code")?.textContent?.match(/\w+/g);
	if (genetic) builder.genetic = genetic.join("") === "UnknownGeneticString" ? null : genetic.join("");

	const friends = [...form.querySelectorAll(".cat-title-loop")].find(x => x.firstChild?.textContent?.startsWith("Friends"))?.querySelector(".bio-scroll");
	if (!friends) return failure("Friends missing");
	if (friends?.textContent?.trim() === "n/a") builder.friends = {};
	else {
		const found = chunk([...friends.childNodes], 3).map(x => [(x[0].childNodes[0] as HTMLElement)?.getAttribute("href")?.match(/&id=(\d+)/)?.[1], x[1]?.textContent?.replace("- ", "").trim()]);
		if (found.some(x => x.includes(undefined))) return failure("Friends invalid");
		builder.friends = Object.fromEntries(found);
	}
	const family = [...form.querySelectorAll(".cat-title-loop")].find(x => x.firstChild?.textContent?.startsWith("Family"))?.querySelector(".bio-scroll");
	if (!family) return failure("Family missing");
	if (family?.textContent?.trim() === "n/a") builder.family = {};
	else {
		const found = chunk([...family.childNodes], 3).map(x => [(x[0].childNodes[0] as HTMLElement)?.getAttribute("href")?.match(/&id=(\d+)/)?.[1], x[1]?.textContent?.replace("- ", "").trim()]);
		if (found.some(x => x.includes(undefined))) return failure("Family invalid");
		builder.family = Object.fromEntries(found);
	}

	const ownerName = doc.querySelector(".breadcrumbs > p")?.firstChild?.textContent?.match(/(.+)\'s Village/)?.[1].trim();
	if (!ownerName) return failure("Owner name missing");
	builder.ownerName = ownerName;

	const ownerId = doc.querySelector(".breadcrumbs > p > a")?.getAttribute("href")?.match(/&id=(\d+)/)?.[1].trim();
	if (!ownerId || isNaN(+ownerId)) return failure("Owner ID missing or invalid");
	builder.ownerId = +ownerId;

	const personality = doc.querySelector(".cat-bio-column1 .rune-group:nth-child(4) .cat-minigroup-r")?.textContent?.match(/(.+) Personality/)?.[1].trim();
	if (!personality) return failure("Personality missing or invalid");
	builder.personality = personality;

	const trinket = doc.querySelector(".horizontalflex:has(.trinket-group) .itemjail img")?.getAttribute("src")?.match(/trinkets\/(.*)\.png/)?.[1];
	if (trinket === undefined) return failure("Trinket missing or invalid");
	builder.trinketName = trinket === "" ? null : trinket;

	const bioElement = doc.querySelector(".cat-title + .editable-userpage-contents");
	if (!bioElement) return failure("Bio missing");
	const bio = new HTML2BBCode().feed(bioElement.innerHTML).toString();
	builder.bio = bio;

	const clothing = [...form.querySelectorAll(".catjail .cat-clothes")].map(x => x.getAttribute("src")?.match(/\/(\w+)\.png/)?.[1]);
	if (clothing.includes(undefined)) return failure("Clothing missing or invalid");
	builder.clothingKeys = clothing as string[];

	return success(builder as RawCat);
};
