"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const DEFAULT_ADDITIONAL_INFO = `If the transfer time is between 22:00 and 06:00 (italian time)
the price will be increased by 20%.
If you need more information don't hesitate to contact us.

Se l'orario del transfer è fra le 22:00 e le 06:00 (Ora italiana)
il prezzo subirà una maggiorazione del 20%.
Se dovesse aver bisogno di ulteriori informazioni, la prego di contattarci.`;

interface CreateQuotationFormProps {
	tripRequestId: string;
}

export function CreateQuotationForm({ tripRequestId }: CreateQuotationFormProps) {
	const router = useRouter();
	const locale = useLocale();
	const utils = api.useUtils();
	const [price, setPrice] = useState("");
	const [isPriceEachWay, setIsPriceEachWay] = useState(false);
	const [areCarSeatsIncluded, setAreCarSeatsIncluded] = useState(false);
	const [quotationAdditionalInfo, setQuotationAdditionalInfo] = useState(
		DEFAULT_ADDITIONAL_INFO,
	);
	const [internalNotes, setInternalNotes] = useState("");

	const createQuotation = api.quotation.create.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: tripRequestId });
			router.push(`/${locale}/admin/requests/${tripRequestId}`);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		createQuotation.mutate({
			tripRequestId,
			price: parseFloat(price),
			currency: "EUR",
			isPriceEachWay,
			areCarSeatsIncluded,
			quotationAdditionalInfo: quotationAdditionalInfo || undefined,
			internalNotes: internalNotes || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="price">Price (EUR) *</Label>
				<Input
					id="price"
					type="number"
					step="0.01"
					min="0"
					value={price}
					onChange={(e) => setPrice(e.target.value)}
					placeholder="150.00"
					required
				/>
			</div>

			<div className="flex items-center justify-between rounded-lg border p-4">
				<div className="space-y-0.5">
					<Label htmlFor="isPriceEachWay">Is price for each way?</Label>
					<p className="text-sm text-muted-foreground">
						If enabled, the price applies to each direction separately
					</p>
				</div>
				<Switch
					id="isPriceEachWay"
					checked={isPriceEachWay}
					onCheckedChange={setIsPriceEachWay}
				/>
			</div>

			<div className="flex items-center justify-between rounded-lg border p-4">
				<div className="space-y-0.5">
					<Label htmlFor="areCarSeatsIncluded">Are car seats included?</Label>
					<p className="text-sm text-muted-foreground">
						If enabled, child car seats are included in the price
					</p>
				</div>
				<Switch
					id="areCarSeatsIncluded"
					checked={areCarSeatsIncluded}
					onCheckedChange={setAreCarSeatsIncluded}
				/>
			</div>

			<div>
				<Label htmlFor="quotationAdditionalInfo">
					Additional Information (Visible to Customer)
				</Label>
				<Textarea
					id="quotationAdditionalInfo"
					value={quotationAdditionalInfo}
					onChange={(e) => setQuotationAdditionalInfo(e.target.value)}
					placeholder="Additional terms and conditions..."
					rows={8}
				/>
			</div>

			<div>
				<Label htmlFor="internalNotes">Internal Notes (Admin Only)</Label>
				<Textarea
					id="internalNotes"
					value={internalNotes}
					onChange={(e) => setInternalNotes(e.target.value)}
					placeholder="Notes for other admins..."
					rows={3}
				/>
			</div>

			<Button
				type="submit"
				disabled={createQuotation.isPending}
				className="w-full"
			>
				{createQuotation.isPending ? "Creating..." : "Create Quotation (Draft)"}
			</Button>

			{createQuotation.error && (
				<p className="text-sm text-destructive">
					{createQuotation.error.message}
				</p>
			)}
		</form>
	);
}
