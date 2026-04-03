import { Currency } from "@/generated/prisma/enums";

export const bestOffersByCurrency = (offers: { priceCount: number; priceType: Currency }[]) => {
	const output = {} as Record<Currency, number>;
	for (const offer of offers) {
		if (!(offer.priceType in output) || output[offer.priceType] > offer.priceCount) output[offer.priceType] = offer.priceCount;
	}
	return Object.entries(output);
};

export const parsePriceType = (raw: string) =>
	({
		Notes: Currency.NOTE,
		"Essence Fragments": Currency.ESSENCE,
		"Lost Buttons": Currency.LOST_BUTTON,
	}[raw]);