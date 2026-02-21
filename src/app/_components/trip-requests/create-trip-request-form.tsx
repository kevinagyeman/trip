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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export function CreateTripRequestForm() {
	const router = useRouter();

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
			numberOfChildSeats: 0,
		},
	});

	const { fields, replace } = useFieldArray({
		control,
		name: "childrenAges",
	});

	const serviceType = watch("serviceType");
	const areThereChildren = watch("areThereChildren");
	const numberOfChildren = watch("numberOfChildren");

	useEffect(() => {
		const count = Number(numberOfChildren) || 0;
		const current = getValues("childrenAges") ?? [];
		replace(
			Array.from({ length: count }, (_, i) => ({
				age: current[i]?.age ?? "",
			})),
		);
	}, [numberOfChildren]);

	const showArrivalFields = serviceType === "both" || serviceType === "arrival";
	const showDepartureFields =
		serviceType === "both" || serviceType === "departure";

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
				<h3 className="text-lg font-semibold">Service Type</h3>
				<Controller
					name="serviceType"
					control={control}
					render={({ field }) => (
						<CustomSelect
							labelText="What service do you need?"
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
					<h3 className="text-lg font-semibold">Arrival Information</h3>

					<Controller
						name="arrivalAirport"
						control={control}
						render={({ field }) => (
							<CustomSelect
								labelText="Arrival Airport *"
								placeholder="Select arrival airport"
								options={AIRPORTS}
								value={field.value ?? ""}
								onValueChange={field.onChange}
								error={errors.arrivalAirport?.message}
							/>
						)}
					/>

					<CustomInput
						labelText="Destination Address *"
						placeholder="Enter your destination address"
						error={errors.destinationAddress?.message}
						inputProps={{ ...register("destinationAddress") }}
					/>
				</div>
			)}

			{/* Departure Information */}
			{showDepartureFields && (
				<div className="space-y-4 rounded-lg border p-4">
					<h3 className="text-lg font-semibold">Departure Information</h3>

					<CustomInput
						labelText="Pickup Address *"
						placeholder="Enter pickup address"
						error={errors.pickupAddress?.message}
						inputProps={{ ...register("pickupAddress") }}
					/>

					<Controller
						name="departureAirport"
						control={control}
						render={({ field }) => (
							<CustomSelect
								labelText="Departure Airport *"
								placeholder="Select departure airport"
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
				<h3 className="text-lg font-semibold">Travel Information</h3>

				<Controller
					name="language"
					control={control}
					render={({ field }) => (
						<CustomSelect
							labelText="Preferred Language"
							options={LANGUAGES}
							value={field.value}
							onValueChange={field.onChange}
						/>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<CustomInput
						labelText="First Name *"
						placeholder="First name"
						error={errors.firstName?.message}
						inputProps={{ ...register("firstName") }}
					/>
					<CustomInput
						labelText="Last Name *"
						placeholder="Last name"
						error={errors.lastName?.message}
						inputProps={{ ...register("lastName") }}
					/>
				</div>

				<CustomInput
					labelText="Phone Number (with country code) *"
					placeholder="+39 123 456 7890"
					error={errors.phone?.message}
					inputProps={{ ...register("phone") }}
				/>

				<CustomInput
					labelText="Number of Adults *"
					inputType="number"
					error={errors.numberOfAdults?.message}
					inputProps={{ ...register("numberOfAdults"), min: 1, max: 100 }}
				/>
			</div>

			{/* Children Information */}
			<div className="space-y-4 rounded-lg border p-4">
				<h3 className="text-lg font-semibold">Children Information</h3>

				<CustomCheckbox
					label="Are there children traveling?"
					inputProps={{ ...register("areThereChildren") }}
				/>

				{areThereChildren && (
					<>
						<CustomInput
							labelText="Number of Children"
							inputType="number"
							error={errors.numberOfChildren?.message}
							inputProps={{ ...register("numberOfChildren"), min: 0, max: 20 }}
						/>
						{fields.map((field, index) => (
							<CustomInput
								key={field.id}
								labelText={`Child ${index + 1} age *`}
								placeholder="e.g., 3 years"
								error={errors.childrenAges?.[index]?.age?.message}
								inputProps={{ ...register(`childrenAges.${index}.age`) }}
							/>
						))}
						<CustomInput
							labelText="Number of Child Seats"
							inputType="number"
							error={errors.numberOfChildSeats?.message}
							inputProps={{
								...register("numberOfChildSeats"),
								min: 0,
								max: 20,
							}}
						/>
					</>
				)}
			</div>

			{/* Additional Information */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Additional Information</h3>
				<Label>Special Requests (Optional)</Label>
				<Textarea
					{...register("additionalInfo")}
					placeholder="Any special requests or additional information..."
					rows={4}
				/>
			</div>

			<div className="rounded-lg bg-muted p-4 text-sm">
				<p>
					* Flight details (dates, times, numbers) can be added later after you
					receive and accept a quotation.
				</p>
			</div>

			<Button
				type="submit"
				disabled={createRequest.isPending}
				className="w-full"
			>
				{createRequest.isPending ? "Submitting..." : "Submit Quotation Request"}
			</Button>

			{createRequest.error && (
				<p className="text-sm text-destructive">
					{createRequest.error.message}
				</p>
			)}
		</form>
	);
}
