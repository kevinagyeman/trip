import type React from "react";
import { Label } from "@/components/ui/label";

type CustomCheckboxProps = {
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	label: string;
};

function CustomCheckbox({ inputProps, label }: CustomCheckboxProps) {
	return (
		<div>
			<div className="flex items-center space-x-2">
				<input type="checkbox" {...inputProps} />
				<Label>{label}</Label>
			</div>
		</div>
	);
}

export default CustomCheckbox;
