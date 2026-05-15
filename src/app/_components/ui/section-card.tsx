import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SectionCard({
	title,
	subtitle,
	children,
	contentClassName,
}: {
	title?: React.ReactNode;
	subtitle?: React.ReactNode;
	children: React.ReactNode;
	contentClassName?: string;
}) {
	return (
		<Card className="gap-0">
			{(title ?? subtitle) && (
				<CardHeader className="pb-0">
					{title && (
						<CardTitle className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
							{title}
						</CardTitle>
					)}
					{subtitle && (
						<CardDescription className="pb-4">{subtitle}</CardDescription>
					)}
				</CardHeader>
			)}
			<CardContent
				className={contentClassName ?? ((title ?? subtitle) ? "pt-0" : "pt-4")}
			>
				{children}
			</CardContent>
		</Card>
	);
}
