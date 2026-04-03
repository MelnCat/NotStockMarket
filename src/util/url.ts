export const pceLink = (path: string) =>
	path.startsWith("blob:") || path.startsWith("data:")
		? path
		: path.startsWith("https://")
		? `https://pce.crab.trade${new URL(path).pathname}`
		: `https://pce.crab.trade/${path}`;