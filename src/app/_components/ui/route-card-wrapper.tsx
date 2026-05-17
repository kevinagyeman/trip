import type { ReactNode } from "react";

interface Props {
	isLast: boolean;
	children: ReactNode;
}

export function RouteCardWrapper({ isLast, children }: Props) {
	return (
		<div>
			<div className="overflow-hidden rounded-lg border-2">{children}</div>
			{!isLast && (
				<div className="flex justify-center">
					<div className="w-0.5 bg-border" style={{ height: "2rem" }} />
				</div>
			)}
		</div>
	);
}
