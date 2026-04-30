"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HIDDEN_PATHS = ["/book/", "/request/"];

export function CrispVisibility() {
	const pathname = usePathname();

	useEffect(() => {
		const shouldHide = HIDDEN_PATHS.some((p) => pathname.includes(p));
		if (typeof window !== "undefined" && window.$crisp) {
			window.$crisp.push(["do", shouldHide ? "chat:hide" : "chat:show"]);
		}
	}, [pathname]);

	return null;
}
