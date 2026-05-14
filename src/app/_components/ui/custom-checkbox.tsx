import type React from "react";
import { Label } from "@/components/ui/label";

type CustomCheckboxProps = {
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	label: React.ReactNode;
	error?: string;
};

function CustomCheckbox({ inputProps, label, error }: CustomCheckboxProps) {
	return (
		<div>
			<div className="flex items-center space-x-2">
				<input type="checkbox" {...inputProps} />
				<Label>{label}</Label>
			</div>
			{error && <small className="text-xs text-destructive">{error}</small>}
		</div>
	);
}

export default CustomCheckbox;
