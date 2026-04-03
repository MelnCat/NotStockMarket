"use client";
import { fonts } from "@/util/font";
import styles from "./FontSwitcher.module.scss";
import { useRouter } from "next/navigation";

export const FontSwitcher = ({ defaultFont }: { defaultFont: string }) => {
	const router = useRouter();
	return (
		<div className={styles.fontChanger}>
			Font{" "}
			<select
				defaultValue={defaultFont}
				onChange={async e => {
					await cookieStore.set("font", e.target.value);
					router.refresh();
				}}
			>
				{Object.entries(fonts).map(([k, v]) => (
					<option key={k} value={k}>
						{v.name}
					</option>
				))}
			</select>
		</div>
	);
};
