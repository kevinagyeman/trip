"use client";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { isValidElement, type ComponentProps } from "react";

type Props = ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		isLoading?: boolean;
		asChild?: boolean;
	};

export function LoadingButton({
	isLoading,
	children,
	disabled,
	className,
	size,
	variant,
	...props
}: Props) {
	const t = useTranslations("common");
	const isIconOnly = isValidElement(children);
	const resolvedSize = size ?? (isIconOnly ? "icon" : undefined);
	const resolvedVariant = variant ?? "secondary";

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
			) : (
				(children ?? t("save"))
			)}
		</Button>
	);
}
