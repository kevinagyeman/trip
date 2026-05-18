"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { RequiredLabel } from "./required-label";

type CustomInputProps = {
	labelText?: string;
	required?: boolean;
	inputType?: string;
	placeholder?: string;
	hint?: string;
	pattern?: string;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	inputClassName?: string;
	error?: string;
	className?: string;
};

function CustomInput({
	labelText,
	required,
	inputType = "text",
	placeholder,
	hint,
	pattern,
	inputProps,
	inputClassName,
	error,
	className,
}: CustomInputProps) {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = inputType === "password";
	const resolvedType = isPassword
		? showPassword
			? "text"
			: "password"
		: inputType;

	return (
		<div className={className}>
			{labelText && (
				<Label className="mb-2">
					{labelText}
					{required && <RequiredLabel />}
				</Label>
			)}
			<div className={isPassword ? "relative" : undefined}>
				<Input
					type={resolvedType}
					placeholder={placeholder}
					pattern={pattern}
					{...inputProps}
					className={cn(isPassword ? "pr-10" : undefined, inputClassName)}
					autoComplete="on"
				/>
				{isPassword && (
					<button
						type="button"
						tabIndex={-1}
						onClick={() => setShowPassword((v) => !v)}
						className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
				)}
			</div>
			{hint && <small className="text-xs text-muted-foreground">{hint}</small>}
			{error && <small className="text-xs text-destructive">{error}</small>}
		</div>
	);
}

export default CustomInput;
