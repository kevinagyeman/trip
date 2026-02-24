import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type SelectOption = {
	value: string;
	label: string;
};

type CustomSelectProps = {
	labelText?: string;
	placeholder?: string;
	hint?: string;
	error?: string;
	options: readonly SelectOption[];
	value: string;
	onValueChange: (value: string) => void;
};

function CustomSelect({
	labelText,
	placeholder,
	hint,
	error,
	options,
	value,
	onValueChange,
}: CustomSelectProps) {
	return (
		<div>
			{labelText && <Label className="mb-2">{labelText}</Label>}
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger className={error ? "border-destructive" : ""}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{hint && <small className="text-xs text-muted-foreground">{hint}</small>}
			{error && <small className="text-xs text-destructive">{error}</small>}
		</div>
	);
}

export default CustomSelect;
