"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
	open: boolean;
	title: string;
	confirmLabel: string;
	onConfirm: () => void;
	children: ReactNode;
}

export function NoticeDialog({
	open,
	title,
	confirmLabel,
	onConfirm,
	children,
}: Props) {
	return (
		<Dialog open={open} onOpenChange={() => undefined}>
			<DialogContent
				showCloseButton={false}
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				onOpenAutoFocus={(e) => e.preventDefault()}
				className="flex flex-col max-h-[90vh] sm:max-w-sm p-0 gap-0"
			>
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>
				<DialogFooter className="px-6 py-4 border-t">
					<Button onClick={onConfirm} className="flex-1">
						<Check />
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
