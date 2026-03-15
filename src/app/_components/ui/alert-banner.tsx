import type { ReactNode } from "react";

type Variant = "info" | "success" | "error" | "warning";

const styles: Record<
	Variant,
	{ wrapper: string; title: string; description: string }
> = {
	info: {
		wrapper:
			"rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30",
		title: "font-semibold text-blue-900 dark:text-blue-200",
		description: "text-blue-800 dark:text-blue-300",
	},
	success: {
		wrapper:
			"rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30",
		title: "font-semibold text-green-800 dark:text-green-300",
		description: "text-green-700 dark:text-green-400",
	},
	error: {
		wrapper:
			"rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30",
		title: "font-semibold text-red-800 dark:text-red-300",
		description: "text-red-700 dark:text-red-400",
	},
	warning: {
		wrapper:
			"rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30",
		title: "font-semibold text-yellow-900 dark:text-yellow-200",
		description: "text-yellow-800 dark:text-yellow-300",
	},
};

interface AlertBannerProps {
	variant: Variant;
	title?: ReactNode;
	description?: ReactNode;
	className?: string;
}

export function AlertBanner({
	variant,
	title,
	description,
	className,
}: AlertBannerProps) {
	const s = styles[variant];
	return (
		<div className={`${s.wrapper}${className ? ` ${className}` : ""}`}>
			{title && <p className={s.title}>{title}</p>}
			{description && (
				<p className={`text-sm${title ? " mt-1" : ""} ${s.description}`}>
					{description}
				</p>
			)}
		</div>
	);
}
