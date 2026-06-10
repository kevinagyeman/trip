"use client";

import { AppDialog } from "@/app/_components/ui/app-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string) => void;
	isLoading: boolean;
}

export function RejectionReasonDialog({
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: Props) {
	const t = useTranslations("requestDetail");
	const [selected, setSelected] = useState<string>("");
	const [otherText, setOtherText] = useState("");

	const OTHER = t("rejectionReasonOther");

	const reasons = [
		t("rejectionReasonPriceTooHigh"),
		t("rejectionReasonNoLongerNeeded"),
		t("rejectionReasonFoundOtherProvider"),
		t("rejectionReasonChangedDates"),
		OTHER,
	];

	function handleConfirm() {
		const reason =
			selected === OTHER && otherText.trim() ? otherText.trim() : selected;
		onConfirm(reason);
	}

	return (
		<AppDialog
			open={open}
			onOpenChange={onOpenChange}
			title={t("rejectionReasonTitle")}
			onSave={handleConfirm}
			isLoading={isLoading}
			saveLabel={t("rejectionReasonConfirm")}
		>
			<div className="space-y-4">
				<RadioGroup
					value={selected}
					onValueChange={setSelected}
					className="gap-3"
				>
					{reasons.map((reason) => (
						<Label
							key={reason}
							htmlFor={reason}
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
								selected === reason
									? "border-primary bg-primary/10"
									: "border-border hover:bg-muted/50"
							}`}
						>
							<span className="text-sm font-medium">{reason}</span>
							<RadioGroupItem value={reason} id={reason} />
						</Label>
					))}
				</RadioGroup>

				{selected === OTHER && (
					<Textarea
						placeholder={t("rejectionReasonOtherPlaceholder")}
						value={otherText}
						onChange={(e) => setOtherText(e.target.value)}
						rows={3}
						className="resize-none"
						autoFocus
					/>
				)}
			</div>
		</AppDialog>
	);
}
