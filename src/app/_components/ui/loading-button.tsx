import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

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
	...props
}: Props) {
	return (
		<Button
			disabled={isLoading ?? disabled}
			className={cn(className)}
			{...props}
		>
			{isLoading && <Loader2 className="animate-spin" />}
			{children}
		</Button>
	);
}
