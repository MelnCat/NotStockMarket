import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { existsSync } from "fs";
import path from "path";

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

const hasClothing = (prefix: string, item: string) => existsSync(path.join(process.cwd(), "..", "pcefiles", "images", "clothing", prefix, item));

console.log("[C]");
console.log(clothing.filter(x => !hasClothing("c", x.key)).map(x => x.key));

console.log("[M]");
console.log(clothing.filter(x => !hasClothing("m", x.key)).map(x => x.key));
