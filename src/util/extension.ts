import { useEventListener } from "usehooks-ts";

export const useExtData = (cb: (event: CustomEvent<{ type: string; data: Uint8Array<ArrayBuffer>; url: string }>) => void) => {
	useEventListener("extdata" as keyof WindowEventMap, event => {
		cb(event as CustomEvent<{ type: string; data: Uint8Array<ArrayBuffer>; url: string }>);
	});
};