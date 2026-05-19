"use client";

import { Link } from "@/i18n/navigation";

export function BrandLogo({
	label,
	isLoggedIn,
	href = "/",
}: {
	label: string;
	isLoggedIn: boolean;
	href?: string;
}) {
	if (isLoggedIn) {
		return (
			<Link href={href} className="text-xl font-bold">
				{label}
			</Link>
		);
	}

	return (
		<button
			type="button"
			className="text-xl font-bold cursor-pointer"
			onClick={() => window.location.reload()}
		>
			{label}
		</button>
	);
}
