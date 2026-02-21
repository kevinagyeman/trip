"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CustomInput from "@/app/_components/ui/custom-input";
import {
	createQuotationSchema,
	type CreateQuotationFormValues,
} from "@/lib/schemas/quotation";

const DEFAULT_ADDITIONAL_INFO = `If the transfer time is between 22:00 and 06:00 (italian time)
the price will be increased by 20%.
If you need more information don't hesitate to contact us.

Se l'orario del transfer è fra le 22:00 e le 06:00 (Ora italiana)
il prezzo subirà una maggiorazione del 20%.
Se dovesse aver bisogno di ulteriori informazioni, la prego di contattarci.`;

interface CreateQuotationFormProps {
	tripRequestId: string;
}

export function CreateQuotationForm({
	tripRequestId,
}: CreateQuotationFormProps) {
	const router = useRouter();
	const utils = api.useUtils();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<CreateQuotationFormValues>({
		resolver: zodResolver(createQuotationSchema),
		defaultValues: {
			isPriceEachWay: false,
			areCarSeatsIncluded: false,
			quotationAdditionalInfo: DEFAULT_ADDITIONAL_INFO,
			internalNotes: "",
		},
	});

	const createQuotation = api.quotation.create.useMutation({
		onSuccess: async () => {
			await utils.tripRequest.getByIdAdmin.invalidate({ id: tripRequestId });
			router.push(`/admin/requests/${tripRequestId}`);
		},
	});

	const onSubmit = (values: CreateQuotationFormValues) => {
		createQuotation.mutate({
			tripRequestId,
			price: values.price,
			currency: "EUR",
			isPriceEachWay: values.isPriceEachWay,
			areCarSeatsIncluded: values.areCarSeatsIncluded,
			quotationAdditionalInfo: values.quotationAdditionalInfo || undefined,
			internalNotes: values.internalNotes || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<CustomInput
				labelText="Price (EUR) *"
				inputType="number"
				placeholder="150.00"
				error={errors.price?.message}
				inputProps={{ ...register("price"), step: "0.01", min: "0" }}
			/>

			<div className="flex items-center justify-between rounded-lg border p-4">
				<div className="space-y-0.5">
					<Label>Is price for each way?</Label>
					<p className="text-sm text-muted-foreground">
						If enabled, the price applies to each direction separately
					</p>
				</div>
				<Controller
					name="isPriceEachWay"
					control={control}
					render={({ field }) => (
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					)}
				/>
			</div>

			<div className="flex items-center justify-between rounded-lg border p-4">
				<div className="space-y-0.5">
					<Label>Are car seats included?</Label>
					<p className="text-sm text-muted-foreground">
						If enabled, child car seats are included in the price
					</p>
				</div>
				<Controller
					name="areCarSeatsIncluded"
					control={control}
					render={({ field }) => (
						<Switch checked={field.value} onCheckedChange={field.onChange} />
					)}
				/>
			</div>

			<div>
				<Label>Additional Information (Visible to Customer)</Label>
				<Textarea
					{...register("quotationAdditionalInfo")}
					placeholder="Additional terms and conditions..."
					rows={8}
				/>
			</div>

			<div>
				<Label>Internal Notes (Admin Only)</Label>
				<Textarea
					{...register("internalNotes")}
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
