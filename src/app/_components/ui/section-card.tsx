import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCard({
	title,
	headerAction,
	children,
	contentClassName,
}: {
	title?: React.ReactNode;
	headerAction?: React.ReactNode;
	children: React.ReactNode;
	contentClassName?: string;
}) {
	return (
		<Card className="gap-0">
			{title && (
				<CardHeader className="pb-0">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">{title}</CardTitle>
						{headerAction}
					</div>
				</CardHeader>
			)}
			<CardContent className={contentClassName ?? (title ? "pt-0" : "pt-4")}>
				{children}
			</CardContent>
		</Card>
	);
}
