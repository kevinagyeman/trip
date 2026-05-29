import { cn } from "@/lib/utils";

export function PageCenter({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex min-h-page items-center justify-center p-4",
				className,
			)}
		>
			{children}
		</div>
	);
}
