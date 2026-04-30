"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HIDDEN_PATHS = ["/book/", "/request/"];

export function CrispVisibility() {
	const pathname = usePathname();

	useEffect(() => {
		const shouldHide = HIDDEN_PATHS.some((p) => pathname.includes(p));
		const crisp = (window as unknown as { $crisp?: unknown[] }).$crisp;
		if (crisp) {
			crisp.push(["do", shouldHide ? "chat:hide" : "chat:show"]);
		}
	}, [pathname]);

	return null;
}
