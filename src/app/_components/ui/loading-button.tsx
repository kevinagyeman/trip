"use client";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { isValidElement, type ComponentProps } from "react";

type Props = ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		isLoading?: boolean;
		asChild?: boolean;
		notifyCustomer?: boolean;
		notifyAdmin?: boolean;
	};

export function LoadingButton({
	isLoading,
	children,
	disabled,
	className,
	size,
	variant,
	notifyCustomer,
	notifyAdmin,
	...props
}: Props) {
	const t = useTranslations("common");
	const isIconOnly = isValidElement(children);
	const resolvedSize = size ?? (isIconOnly ? "icon" : undefined);
	const resolvedVariant = variant ?? "secondary";
	const suffix = notifyCustomer
		? ` ${t("notifyCustomerSuffix")}`
		: notifyAdmin
			? ` ${t("notifyAdminSuffix")}`
			: "";

	return (
		<Button
			disabled={isLoading ?? disabled}
			className={cn(className)}
			size={resolvedSize}
			variant={resolvedVariant}
			{...props}
		>
			{isLoading ? (
				<Loader2 className="animate-spin" />
			) : suffix ? (
				<>
					{children ?? (
						<>
							<Check />
							{t("save")}
						</>
					)}
					{suffix}
				</>
			) : (
				(children ?? (
					<>
						<Check />
						{t("save")}
					</>
				))
			)}
		</Button>
	);
}
