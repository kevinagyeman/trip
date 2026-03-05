import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type React from "react";

type CustomTextAreaProps = {
	labelText: string;
	placeholder: string;
	hint?: string;
	rows?: number;
	textAreaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
	error?: string;
};

function CustomTextArea({
	labelText,
	placeholder,
	hint,
	rows = 1,
	textAreaProps,
	error,
}: CustomTextAreaProps) {
	return (
		<div>
			<Label className="mb-2">{labelText}</Label>
			<Textarea
				placeholder={placeholder}
				rows={rows}
				{...textAreaProps}
				className="min-h-60"
			/>
			{hint && <small className="text-xs text-muted-foreground">{hint}</small>}
			{error && <small className="text-xs text-orange-800">{error}</small>}
		</div>
	);
}

export default CustomTextArea;
