import { getClothing } from "@/db/db";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = await getClothing();
		return Response.json(data);
	} catch {
		return Response.json({ error: "Failed to fetch clothing" }, { status: 500 });
	}
}
