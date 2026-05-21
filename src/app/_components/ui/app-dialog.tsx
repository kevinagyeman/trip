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
import { Check, X } from "lucide-react";
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
	notifyCustomer?: boolean;
	notifyAdmin?: boolean;
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
	notifyCustomer,
	notifyAdmin,
	trigger,
}: Props) {
	const t = useTranslations("common");
	const suffix = notifyCustomer
		? ` ${t("notifyCustomerSuffix")}`
		: notifyAdmin
			? ` ${t("notifyAdminSuffix")}`
			: "";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent
				showCloseButton={false}
				onInteractOutside={(e) => e.preventDefault()}
				onOpenAutoFocus={(e) => e.preventDefault()}
				className="flex flex-col max-h-[90vh] sm:max-w-sm p-0 gap-0"
			>
				<DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between">
					<DialogTitle>{title}</DialogTitle>
					<Button
						variant="outline"
						size="icon"
						onClick={() => onOpenChange(false)}
					>
						<X />
					</Button>
				</DialogHeader>

				<div className="overflow-y-auto px-6 py-4 flex-1">{children}</div>

				<DialogFooter className="px-6 py-4 border-t flex-row gap-2">
					<LoadingButton
						isLoading={isLoading}
						onClick={onSave}
						variant="default"
						className="flex-1"
					>
						<Check />
						{saveLabel ?? t("save")}
						{suffix}
					</LoadingButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
