"use client";

import { Link } from "@/i18n/navigation";

export function BrandLogo({
	label,
	isLoggedIn,
}: {
	label: string;
	isLoggedIn: boolean;
}) {
	if (isLoggedIn) {
		return (
			<Link href="/" className="text-xl font-bold">
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
