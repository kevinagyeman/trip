"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";

export function BrandLogo({
	label,
	href = "/",
}: {
	label: string;
	href?: string;
}) {
	const pathname = usePathname();
	const isBookPage = /\/book\//.test(pathname);

	return (
		<Link
			href={href}
			className="text-xl font-bold"
			onClick={(e) => {
				if (isBookPage) {
					e.preventDefault();
					window.location.reload();
				}
			}}
		>
			{label}
		</Link>
	);
}
