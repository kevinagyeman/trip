"use client";

import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIRPORTS, LANGUAGES, SERVICE_TYPES } from "@/lib/airports";
import {
	createTripRequestSchema,
	type CreateTripRequestFormValues,
} from "@/lib/schemas/trip-request";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export function CreateTripRequestForm() {
	const router = useRouter();
	const t = useTranslations("tripRequest");

	const {
		register,
		handleSubmit,
		control,
		watch,
		getValues,
		formState: { errors },
	} = useForm<CreateTripRequestFormValues>({
		resolver: zodResolver(createTripRequestSchema),
		defaultValues: {
			serviceType: "both",
			language: "English",
			numberOfAdults: 1,
			areThereChildren: false,
			numberOfChildren: 1,
			childrenAges: [],
			numberOfChildSeats: 1,
		},
	});

	const { fields, replace } = useFieldArray({
		control,
		name: "childrenAges",
	});

	const serviceType = watch("serviceType");
	const areThereChildren = watch("areThereChildren");
	const numberOfChildren = watch("numberOfChildren");

	const showArrivalFields = serviceType === "both" || serviceType === "arrival";
	const showDepartureFields =
		serviceType === "both" || serviceType === "departure";

	useEffect(() => {
		const count = Number(numberOfChildren) || 0;
		const current = getValues("childrenAges") ?? [];
		replace(
			Array.from({ length: count }, (_, i) => ({
				age: current[i]?.age ?? "",
			})),
		);
	}, [numberOfChildren]);

	const createRequest = api.tripRequest.create.useMutation({
		onSuccess: (data) => {
			router.push(`/dashboard/requests/${data.id}`);
		},
	});

	const onSubmit = (values: CreateTripRequestFormValues) => {
		createRequest.mutate({
			serviceType: values.serviceType,
			arrivalAirport: values.arrivalAirport || undefined,
			destinationAddress: values.destinationAddress || undefined,
			pickupAddress: values.pickupAddress || undefined,
			departureAirport: values.departureAirport || undefined,
			language: values.language,
			firstName: values.firstName,
			lastName: values.lastName,
			phone: values.phone,
			numberOfAdults: values.numberOfAdults,
			areThereChildren: values.areThereChildren,
			numberOfChildren: values.areThereChildren
				? values.numberOfChildren
				: undefined,
			ageOfChildren:
				values.areThereChildren && values.childrenAges?.length
					? values.childrenAges.map((c) => c.age).join(", ")
					: undefined,
			numberOfChildSeats: values.areThereChildren
				? values.numberOfChildSeats
				: undefined,
			additionalInfo: values.additionalInfo || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Service Type */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">{t("serviceType")}</h3>
				<Controller
					name="serviceType"
					control={control}
					render={({ field }) => (
						<CustomSelect
							labelText={t("serviceTypeQuestion")}
							options={SERVICE_TYPES}
							value={field.value}
							onValueChange={field.onChange}
						/>
					)}
				/>
			</div>

			{/* Arrival Information */}
			{showArrivalFields && (
				<div className="space-y-4 rounded-lg border p-4">
					<h3 className="text-lg font-semibold">{t("arrivalInformation")}</h3>

					<Controller
						name="arrivalAirport"
						control={control}
						render={({ field }) => (
							<CustomSelect
								labelText={t("arrivalAirport")}
								placeholder={t("selectArrivalAirport")}
								options={AIRPORTS}
								value={field.value ?? ""}
								onValueChange={field.onChange}
								error={errors.arrivalAirport?.message}
							/>
						)}
					/>

					<CustomInput
						labelText={t("destinationAddress")}
						placeholder={t("destinationAddressPlaceholder")}
						error={errors.destinationAddress?.message}
						inputProps={{ ...register("destinationAddress") }}
					/>
				</div>
			)}

			{/* Departure Information */}
			{showDepartureFields && (
				<div className="space-y-4 rounded-lg border p-4">
					<h3 className="text-lg font-semibold">{t("departureInformation")}</h3>

					<CustomInput
						labelText={t("pickupAddress")}
						placeholder={t("pickupAddressPlaceholder")}
						error={errors.pickupAddress?.message}
						inputProps={{ ...register("pickupAddress") }}
					/>

					<Controller
						name="departureAirport"
						control={control}
						render={({ field }) => (
							<CustomSelect
								labelText={t("departureAirport")}
								placeholder={t("selectDepartureAirport")}
								options={AIRPORTS}
								value={field.value ?? ""}
								onValueChange={field.onChange}
								error={errors.departureAirport?.message}
							/>
						)}
					/>
				</div>
			)}

			{/* Travel Information */}
			<div className="space-y-4 rounded-lg border p-4">
				<h3 className="text-lg font-semibold">{t("travelInformation")}</h3>

				<Controller
					name="language"
					control={control}
					render={({ field }) => (
						<CustomSelect
							labelText={t("preferredLanguage")}
							options={LANGUAGES}
							value={field.value}
							onValueChange={field.onChange}
						/>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<CustomInput
						labelText={t("firstName")}
						placeholder={t("firstNamePlaceholder")}
						error={errors.firstName?.message}
						inputProps={{ ...register("firstName") }}
					/>
					<CustomInput
						labelText={t("lastName")}
						placeholder={t("lastNamePlaceholder")}
						error={errors.lastName?.message}
						inputProps={{ ...register("lastName") }}
					/>
				</div>

				<CustomInput
					labelText={t("phoneNumber")}
					placeholder={t("phonePlaceholder")}
					error={errors.phone?.message}
					inputProps={{ ...register("phone") }}
				/>

				<CustomInput
					labelText={t("numberOfAdults")}
					inputType="number"
					error={errors.numberOfAdults?.message}
					inputProps={{ ...register("numberOfAdults"), min: 1, max: 100 }}
				/>
			</div>

			{/* Children Information */}
			<div className="space-y-4 rounded-lg border p-4">
				<h3 className="text-lg font-semibold">{t("childrenInformation")}</h3>

				<CustomCheckbox
					label={t("areThereChildren")}
					inputProps={{ ...register("areThereChildren") }}
				/>

				{areThereChildren && (
					<>
						<CustomInput
							labelText={t("numberOfChildren")}
							inputType="number"
							error={errors.numberOfChildren?.message}
							inputProps={{ ...register("numberOfChildren"), min: 0, max: 20 }}
						/>
						{fields.map((field, index) => (
							<CustomInput
								key={field.id}
								labelText={t("childAge", { n: index + 1 })}
								placeholder={t("childAgePlaceholder")}
								error={errors.childrenAges?.[index]?.age?.message}
								inputProps={{ ...register(`childrenAges.${index}.age`) }}
							/>
						))}
						<CustomInput
							labelText={t("numberOfChildSeats")}
							inputType="number"
							error={errors.numberOfChildSeats?.message}
							inputProps={{ ...register("numberOfChildSeats"), min: 0, max: 20 }}
						/>
					</>
				)}
			</div>

			{/* Additional Information */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">{t("additionalInformation")}</h3>
				<Label>{t("specialRequests")}</Label>
				<Textarea
					{...register("additionalInfo")}
					placeholder={t("specialRequestsPlaceholder")}
					rows={4}
				/>
			</div>

			<div className="rounded-lg bg-muted p-4 text-sm">
				<p>{t("flightDetailsNote")}</p>
			</div>

			<Button type="submit" disabled={createRequest.isPending} className="w-full">
				{createRequest.isPending ? t("submitting") : t("submitRequest")}
			</Button>

			{createRequest.error && (
				<p className="text-sm text-destructive">{createRequest.error.message}</p>
			)}
		</form>
	);
}
