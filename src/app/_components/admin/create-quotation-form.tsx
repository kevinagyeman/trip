"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateQuotationFormProps {
	tripRequestId: string;
	onSuccess?: () => void;
}

export function CreateQuotationForm({
	tripRequestId,
	onSuccess,
}: CreateQuotationFormProps) {
	const utils = api.useUtils();
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [internalNotes, setInternalNotes] = useState("");
	const [validUntil, setValidUntil] = useState<Date>();

	const createQuotation = api.quotation.create.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: tripRequestId });
			setPrice("");
			setDescription("");
			setInternalNotes("");
			setValidUntil(undefined);
			onSuccess?.();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		createQuotation.mutate({
			tripRequestId,
			price: parseFloat(price),
			description: description || undefined,
			internalNotes: internalNotes || undefined,
			validUntil: validUntil,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="price">Price (USD)</Label>
				<Input
					id="price"
					type="number"
					step="0.01"
					min="0"
					value={price}
					onChange={(e) => setPrice(e.target.value)}
					placeholder="1000.00"
					required
				/>
			</div>

			<div>
				<Label htmlFor="description">Description (Visible to Customer)</Label>
				<Textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Describe what's included in this quotation..."
					rows={4}
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

			<div>
				<Label>Valid Until (Optional)</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!validUntil && "text-muted-foreground",
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{validUntil ? format(validUntil, "PPP") : "No expiry"}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={validUntil}
							onSelect={setValidUntil}
							disabled={(date) => date < new Date()}
						/>
					</PopoverContent>
				</Popover>
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
