import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { existsSync } from "fs";

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.DATABASE_URL,
	}),
}).$extends({
	result: {
		marketEntry: {
			unitPrice: {
				needs: { priceCount: true, itemCount: true },
				compute(marketEntry) {
					return marketEntry.priceCount / marketEntry.itemCount;
				},
			},
		},
	},
});

const clothing = await prisma.item.findMany({ where: { category: "clothing" } });
const custom = await prisma.item.findMany({ where: { category: { startsWith: "custom_clothing" } } });
const cMissing = clothing.filter(x => !existsSync(`../pcefiles/images/clothing/c/${x.key}.png`));
const mMissing = clothing.filter(x => !existsSync(`../pcefiles/images/clothing/m/${x.key}.png`));
const customMissing = custom.filter(x => !existsSync(x.image.replace("https://www.pixelcatsend.com/", "../pcefiles/")));
console.log("CAT");
console.log(JSON.stringify(cMissing.map(x => x.key)));
console.log(JSON.stringify(cMissing.map(x => x.id)));
console.log("MERCAT");
console.log(JSON.stringify(mMissing.map(x => x.key)));
console.log(JSON.stringify(mMissing.map(x => x.id)));
console.log("CUSTOM");
console.log(JSON.stringify(customMissing.map(x => x.key)));
console.log(JSON.stringify(customMissing.map(x => x.id)));
const links = [
	...cMissing.map(x => `https://www.pixelcatsend.com/images/clothing/c/${x.key}.png`),
	...mMissing.map(x => `https://www.pixelcatsend.com/images/clothing/c/${x.key}.png`),
	...customMissing.map(x => x.image),
];

console.log(links.join("\n"));
