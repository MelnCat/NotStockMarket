import { getAllItems, getProcessedItems } from "@/db/db";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = await getProcessedItems();
		return Response.json(data);
	} catch {
		return Response.json({ error: "Failed to fetch items" }, { status: 500 });
	}
}
