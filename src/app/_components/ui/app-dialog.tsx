"use client";

import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
	onSave: () => void;
	isLoading?: boolean;
	saveLabel?: string;
	trigger?: ReactNode;
}

export function AppDialog({
	open,
	onOpenChange,
	title,
	children,
	onSave,
	isLoading = false,
	saveLabel,
	trigger,
}: Props) {
	const t = useTranslations("common");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent
				showCloseButton={false}
				onInteractOutside={(e) => e.preventDefault()}
				className="flex flex-col max-h-[90vh] sm:max-w-sm p-0 gap-0"
			>
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>

				<DialogFooter className="px-6 py-4 border-t flex-row gap-2">
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						{t("close")}
					</Button>
					<LoadingButton
						isLoading={isLoading}
						onClick={onSave}
						variant="default"
						className="flex-1"
					>
						{saveLabel ?? t("save")}
					</LoadingButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
