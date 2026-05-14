"use client";

import CustomInput from "@/app/_components/ui/custom-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { COUNTRY_CODES } from "@/lib/phone";

interface PhoneInputProps {
	countryCode: string;
	onCountryCodeChange: (code: string) => void;
	phoneNumber: string;
	onPhoneNumberChange: (number: string) => void;
	error?: string;
	placeholder?: string;
}

export function PhoneInput({
	countryCode,
	onCountryCodeChange,
	phoneNumber,
	onPhoneNumberChange,
	error,
	placeholder,
}: PhoneInputProps) {
	const flag =
		COUNTRY_CODES.find((c) => c.value === countryCode)?.label.split(" ")[0] ??
		"";

	return (
		<div className="flex gap-2">
			<Select value={countryCode} onValueChange={onCountryCodeChange}>
				<SelectTrigger className="w-[110px] shrink-0">
					<SelectValue>{`${flag} ${countryCode}`}</SelectValue>
				</SelectTrigger>
				<SelectContent className="max-h-72">
					{COUNTRY_CODES.map((c) => (
						<SelectItem key={c.value} value={c.value}>
							{c.label} ({c.value})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<CustomInput
				className="flex-1"
				inputType="tel"
				placeholder={placeholder ?? "1234567890"}
				inputProps={{
					inputMode: "numeric",
					value: phoneNumber,
					onChange: (e) =>
						onPhoneNumberChange(e.target.value.replace(/\D/g, "")),
				}}
			/>
		</div>
	);
}
