import { parseDom } from "@/util/dom";
import { failure, Result, success } from "@/util/result";

export interface RawShop {
	url: string;
	name: string;
	description: string;
	previewImage: string;
	category: string;
}

export const parseShopListPage = (content: string): Result<RawShop[]> => {
	const doc = parseDom(content);
	const list = doc.querySelector(".forumwide-content-area > .horizontalflex.wrapflex.justify");
	if (!list) return failure("Invalid page layout");
	const lines = list.children;
	const entries: RawShop[] = [];
	const category = doc.querySelector(".forumwide-content-area .shopbanner h3")?.textContent?.trim();
	if (!category) return failure("Category missing");
	for (const line of lines) {
		const builder: Partial<RawShop> = { category };

		const link = line.getAttribute("href");
		if (!link) return failure("Shop href missing");
		builder.url = link;

		const box = line.querySelector(".store-box");
		if (!box) return failure("Store box missing");

		const name = box.querySelector("b")?.textContent?.trim();
		if (!name) return failure("Name missing or invalid");
		builder.name = name;

		const description = [...box.childNodes].findLast(x => x.nodeType === 3 /* Node.TEXT */)?.textContent?.trim();

		if (!description) return failure("Description missing or invalid");
		builder.description = description;

		const previewImage = box.querySelector("img")?.getAttribute("src");
		if (!previewImage) return failure("Preview image missing or invalid");
		builder.previewImage = previewImage;

		entries.push(builder as RawShop);
	}
	return success(entries);
};