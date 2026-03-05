"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

type CustomInputProps = {
	labelText?: string;
	inputType?: string;
	placeholder?: string;
	hint?: string;
	pattern?: string;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	error?: string;
};

function CustomInput({
	labelText,
	inputType = "text",
	placeholder,
	hint,
	pattern,
	inputProps,
	error,
}: CustomInputProps) {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = inputType === "password";
	const resolvedType = isPassword
		? showPassword
			? "text"
			: "password"
		: inputType;

	return (
		<div>
			{labelText && <Label className="mb-2">{labelText}</Label>}
			<div className={isPassword ? "relative" : undefined}>
				<Input
					type={resolvedType}
					placeholder={placeholder}
					pattern={pattern}
					{...inputProps}
					className={isPassword ? "pr-10" : undefined}
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
