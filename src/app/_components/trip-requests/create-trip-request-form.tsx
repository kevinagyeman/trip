"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AIRPORTS, SERVICE_TYPES, LANGUAGES } from "@/lib/airports";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import { createTripRequestSchema, type CreateTripRequestFormValues } from "@/lib/schemas/trip-request";

export function CreateTripRequestForm() {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<CreateTripRequestFormValues>({
		resolver: zodResolver(createTripRequestSchema),
		defaultValues: {
			serviceType: "both",
			language: "English",
			numberOfAdults: 1,
			areThereChildren: false,
			numberOfChildren: 0,
			numberOfChildSeats: 0,
		},
	});

	const serviceType = watch("serviceType");
	const areThereChildren = watch("areThereChildren");

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
				values.areThereChildren && values.ageOfChildren
					? values.ageOfChildren
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
				<div>
					<Label>What service do you need?</Label>
					<Controller
						name="serviceType"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SERVICE_TYPES.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>

			{/* Arrival Information */}
			{showArrivalFields && (
				<div className="space-y-4 rounded-lg border p-4">
					<h3 className="text-lg font-semibold">Arrival Information</h3>

					<div>
						<Label>Arrival Airport *</Label>
						<Controller
							name="arrivalAirport"
							control={control}
							render={({ field }) => (
								<Select value={field.value ?? ""} onValueChange={field.onChange}>
									<SelectTrigger
										className={errors.arrivalAirport ? "border-destructive" : ""}
									>
										<SelectValue placeholder="Select arrival airport" />
									</SelectTrigger>
									<SelectContent>
										{AIRPORTS.map((airport) => (
											<SelectItem key={airport.value} value={airport.value}>
												{airport.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.arrivalAirport && (
							<small className="text-xs text-destructive">
								{errors.arrivalAirport.message}
							</small>
						)}
					</div>

					<CustomInput
						labelText="Destination Address *"
						placeholder="Enter your destination address"
						error={errors.destinationAddress?.message}
						inputProps={{
							...register("destinationAddress"),
							className: errors.destinationAddress ? "border-destructive" : "",
						}}
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
						inputProps={{
							...register("pickupAddress"),
							className: errors.pickupAddress ? "border-destructive" : "",
						}}
					/>

					<div>
						<Label>Departure Airport *</Label>
						<Controller
							name="departureAirport"
							control={control}
							render={({ field }) => (
								<Select value={field.value ?? ""} onValueChange={field.onChange}>
									<SelectTrigger
										className={errors.departureAirport ? "border-destructive" : ""}
									>
										<SelectValue placeholder="Select departure airport" />
									</SelectTrigger>
									<SelectContent>
										{AIRPORTS.map((airport) => (
											<SelectItem key={airport.value} value={airport.value}>
												{airport.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.departureAirport && (
							<small className="text-xs text-destructive">
								{errors.departureAirport.message}
							</small>
						)}
					</div>
				</div>
			)}

			{/* Travel Information */}
			<div className="space-y-4 rounded-lg border p-4">
				<h3 className="text-lg font-semibold">Travel Information</h3>

				<div>
					<Label>Preferred Language</Label>
					<Controller
						name="language"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{LANGUAGES.map((lang) => (
										<SelectItem key={lang.value} value={lang.value}>
											{lang.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</div>

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
						<CustomInput
							labelText="Age of Children"
							placeholder="e.g., 3 years, 7 years"
							error={errors.ageOfChildren?.message}
							inputProps={{ ...register("ageOfChildren") }}
						/>
						<CustomInput
							labelText="Number of Child Seats"
							inputType="number"
							error={errors.numberOfChildSeats?.message}
							inputProps={{ ...register("numberOfChildSeats"), min: 0, max: 20 }}
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

			<Button type="submit" disabled={createRequest.isPending} className="w-full">
				{createRequest.isPending ? "Submitting..." : "Submit Quotation Request"}
			</Button>

			{createRequest.error && (
				<p className="text-sm text-destructive">{createRequest.error.message}</p>
			)}
		</form>
	);
}
