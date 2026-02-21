import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
	return (
		<div>
			{labelText && <Label className="mb-2">{labelText}</Label>}
			<Input
				type={inputType}
				placeholder={placeholder}
				pattern={pattern}
				{...inputProps}
				autoComplete="on"
			/>
			{hint && <small className="text-xs text-muted-foreground">{hint}</small>}
			{error && <small className="text-xs text-destructive">{error}</small>}
		</div>
	);
}

export default CustomInput;
