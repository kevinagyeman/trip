import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Check, Loader2 } from "lucide-react";
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
	...props
}: Props) {
	const isIconOnly = !children || isValidElement(children);
	const resolvedSize = size ?? (isIconOnly ? "icon" : undefined);

	return (
		<Button
			disabled={isLoading ?? disabled}
			className={cn(className)}
			size={resolvedSize}
			{...props}
		>
			{isLoading ? (
				<Loader2 className="animate-spin" />
			) : (
				(children ?? <Check className="h-4 w-4" />)
			)}
		</Button>
	);
}
