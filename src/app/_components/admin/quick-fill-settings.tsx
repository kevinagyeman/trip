"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Option = { value: string; label: string };

export function QuickFillSettings() {
	const { data, isLoading } = api.company.getQuickFill.useQuery();

	if (isLoading)
		return <p className="text-sm text-muted-foreground">Loading...</p>;

	return <QuickFillForm initialOptions={data ?? []} />;
}

function QuickFillForm({ initialOptions }: { initialOptions: Option[] }) {
	const utils = api.useUtils();
	const [options, setOptions] = useState<Option[]>(initialOptions);
	const [newValue, setNewValue] = useState("");
	const [newLabel, setNewLabel] = useState("");
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");

	const update = api.company.updateQuickFill.useMutation({
		onSuccess: async () => {
			await utils.company.getQuickFill.invalidate();
			setError("");
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		},
		onError: (e) => {
			setError(e.message);
		},
	});

	const addOption = () => {
		const v = newValue.trim();
		const l = newLabel.trim();
		if (!v || !l) return;
		setOptions((prev) => [...prev, { value: v, label: l }]);
		setNewValue("");
		setNewLabel("");
	};

	const removeOption = (i: number) => {
		setOptions((prev) => prev.filter((_, idx) => idx !== i));
	};

	return (
		<div className="space-y-4 max-w-sm">
			<p className="text-sm text-muted-foreground">
				These shortcuts appear on the booking form so customers can quickly fill
				in pickup and destination fields (e.g. airports, stations).
			</p>

			{/* Existing options */}
			<div className="space-y-2">
				{options.length === 0 && (
					<p className="text-sm text-muted-foreground italic">
						No options yet.
					</p>
				)}
				{options.map((opt, i) => (
					<div
						key={i}
						className="flex items-center gap-2 rounded-lg border px-3 py-2"
					>
						<span className="w-14 shrink-0 text-sm font-medium">
							{opt.value}
						</span>
						<span className="flex-1 truncate text-sm text-muted-foreground">
							{opt.label}
						</span>
						<button
							type="button"
							onClick={() => removeOption(i)}
							className="text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				))}
			</div>

			{/* Add new */}
			<div className="flex gap-2">
				<Input
					placeholder="Code (e.g. VRN)"
					value={newValue}
					onChange={(e) => setNewValue(e.target.value)}
					className="w-28"
				/>
				<Input
					placeholder="Label (e.g. Verona Airport)"
					value={newLabel}
					onChange={(e) => setNewLabel(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && addOption()}
				/>
				<Button type="button" size="icon" variant="outline" onClick={addOption}>
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{error && <p className="text-sm text-destructive">{error}</p>}
			<div className="flex items-center gap-3">
				<Button
					onClick={() => {
						// commit any pending input before saving
						const v = newValue.trim();
						const l = newLabel.trim();
						const finalOptions =
							v && l ? [...options, { value: v, label: l }] : options;
						if (v && l) {
							setOptions(finalOptions);
							setNewValue("");
							setNewLabel("");
						}
						update.mutate({ options: finalOptions });
					}}
					disabled={update.isPending}
				>
					{update.isPending ? "Saving..." : "Save"}
				</Button>
				{saved && (
					<span className="text-sm text-green-600 dark:text-green-400">
						Saved!
					</span>
				)}
			</div>
		</div>
	);
}
