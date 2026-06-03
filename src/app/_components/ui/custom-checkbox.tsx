import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type React from "react";
import { useId } from "react";

type CustomCheckboxProps = {
	id?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label: React.ReactNode;
	error?: string;
};

function CustomCheckbox({
	id,
	checked,
	onCheckedChange,
	label,
	error,
}: CustomCheckboxProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	return (
		<div>
			<div className="flex items-center space-x-2">
				<Checkbox
					id={inputId}
					checked={checked}
					onCheckedChange={onCheckedChange}
				/>
				<Label htmlFor={inputId} className="cursor-pointer font-normal">
					{label}
				</Label>
			</div>
			{error && <small className="text-xs text-destructive">{error}</small>}
		</div>
	);
}

export default CustomCheckbox;
