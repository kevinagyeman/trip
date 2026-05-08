"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function CollapsibleSection({
	title,
	children,
	defaultOpen = false,
	noBorderTop = false,
	editLabel,
}: {
	title: React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
	noBorderTop?: boolean;
	editLabel?: string;
}) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className={noBorderTop ? "" : "border-t border-dashed"}>
			{/* biome-ignore lint/a11y/useSemanticElements: title prop may contain <button> elements, making <button> invalid here */}
			<div
				className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
				role="button"
				tabIndex={0}
				onClick={() => setOpen((v) => !v)}
				onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
			>
				<span className="flex-1 text-left">{title}</span>
				<span className="flex shrink-0 items-center gap-1.5">
					{editLabel && (
						<span className="text-xs text-muted-foreground underline underline-offset-2">
							{editLabel}
						</span>
					)}
					<ChevronDown
						className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
					/>
				</span>
			</div>
			{open && <div className="px-3 pb-3">{children}</div>}
		</div>
	);
}
