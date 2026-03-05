"use client";

import { TripRequestAlert } from "@/app/_components/trip-requests/alert";
import CustomCheckbox from "@/app/_components/ui/custom-checkbox";
import CustomInput from "@/app/_components/ui/custom-input";
import CustomSelect from "@/app/_components/ui/custom-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRY_CODES } from "@/lib/phone";
import { LANGUAGES, QUICK_FILL } from "@/lib/quick-fill";
import {
	createTripRequestSchema,
	type CreateTripRequestFormValues,
} from "@/lib/schemas/trip-request";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export function CreateTripRequestForm({
	companySlug,
}: {
	companySlug: string;
}) {
	const router = useRouter();
	const t = useTranslations("tripRequest");

	const {
		register,
		handleSubmit,
		control,
		watch,
		getValues,
		setValue,
		formState: { errors },
	} = useForm<CreateTripRequestFormValues>({
		resolver: zodResolver(createTripRequestSchema),
		defaultValues: {
			routes: [{ pickup: "", destination: "" }],
			language: "English",
			email: "",
			phoneCountryCode: "+39",
			numberOfAdults: 1,
			areThereChildren: false,
			numberOfChildren: 0,
			childrenAges: [],
			numberOfChildSeats: 0,
		},
	});

	const {
		fields: routeFields,
		append: appendRoute,
		remove: removeRoute,
	} = useFieldArray({ control, name: "routes" });

	const { fields: childrenAgeFields, replace: replaceChildrenAges } =
		useFieldArray({ control, name: "childrenAges" });

	const areThereChildren = watch("areThereChildren");
	const numberOfChildren = watch("numberOfChildren");

	useEffect(() => {
		const count = Number(numberOfChildren) || 0;
		const current = getValues("childrenAges") ?? [];
		replaceChildrenAges(
			Array.from({ length: count }, (_, i) => ({
				age: current[i]?.age ?? "",
				unit: current[i]?.unit ?? "years",
			})),
		);
	}, [numberOfChildren]);

	const createRequest = api.tripRequest.create.useMutation({
		onSuccess: (data) => {
			router.push(`/request/${data.token}`);
		},
	});

	const onSubmit = (values: CreateTripRequestFormValues) => {
		createRequest.mutate({
			companySlug,
			email: values.email,
			routes: values.routes,
			language: values.language,
			firstName: values.firstName,
			lastName: values.lastName,
			phone: `${values.phoneCountryCode} ${values.phoneNumber}`,
			numberOfAdults: values.numberOfAdults,
			areThereChildren: values.areThereChildren,
			numberOfChildren: values.areThereChildren
				? values.numberOfChildren
				: undefined,
			ageOfChildren:
				values.areThereChildren && values.childrenAges?.length
					? values.childrenAges.map((c) => `${c.age} ${c.unit}`).join(", ")
					: undefined,
			numberOfChildSeats: values.areThereChildren
				? values.numberOfChildSeats
				: undefined,
			additionalInfo: values.additionalInfo || undefined,
		});
	};

	const duplicateRoute = (index: number) => {
		const current = getValues(`routes.${index}`);
		appendRoute({
			pickup: current.pickup,
			destination: current.destination,
			departureDate: current.departureDate,
			departureTime: current.departureTime,
			flightNumber: current.flightNumber,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Route boxes */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold">{t("routes")}</h3>

				<TripRequestAlert />

				{routeFields.map((field, index) => (
					<div key={field.id} className="space-y-3 rounded-lg border p-4">
						{/* Route header */}
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-sm text-muted-foreground">
								{t("routeN", { n: index + 1 })}
							</h4>
							<div className="flex gap-1">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => duplicateRoute(index)}
								>
									<Copy className="mr-1 h-3 w-3" />
									{t("duplicateRoute")}
								</Button>
								{routeFields.length > 1 && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => removeRoute(index)}
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>

						{/* Pickup */}
						<div className="space-y-2">
							<CustomInput
								labelText={t("pickup")}
								placeholder={t("pickupPlaceholder")}
								error={errors.routes?.[index]?.pickup?.message}
								inputProps={{ ...register(`routes.${index}.pickup`) }}
							/>
							<div className="flex flex-wrap items-center gap-2">
								<p className="text-xs text-muted-foreground">
									{t("quickFill")}
								</p>
								{QUICK_FILL.map((quickFill) => (
									<Button
										key={quickFill.value}
										type="button"
										variant="outline"
										size="xs"
										onClick={() =>
											setValue(`routes.${index}.pickup`, quickFill.label)
										}
									>
										{quickFill.value}
									</Button>
								))}
							</div>
						</div>

						{/* Destination */}
						<div className="space-y-2 pt-6">
							<CustomInput
								labelText={t("destination")}
								placeholder={t("destinationPlaceholder")}
								error={errors.routes?.[index]?.destination?.message}
								inputProps={{ ...register(`routes.${index}.destination`) }}
							/>
							<div className="flex flex-wrap items-center gap-2">
								<p className="text-xs text-muted-foreground">
									{t("quickFill")}
								</p>
								{QUICK_FILL.map((quickFill) => (
									<Button
										key={quickFill.value}
										type="button"
										variant="outline"
										size="xs"
										onClick={() =>
											setValue(`routes.${index}.destination`, quickFill.label)
										}
									>
										{quickFill.value}
									</Button>
								))}
							</div>
						</div>

						{/* Optional departure details */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-6">
							<CustomInput
								labelText={t("routeDepartureDate")}
								inputProps={{
									...register(`routes.${index}.departureDate`),
									type: "date",
								}}
							/>

							<CustomInput
								labelText={t("routeDepartureTime")}
								inputProps={{
									...register(`routes.${index}.departureTime`),
									type: "time",
								}}
							/>
							<CustomInput
								labelText={t("routeFlightNumber")}
								placeholder={t("routeFlightNumberPlaceholder")}
								inputProps={{ ...register(`routes.${index}.flightNumber`) }}
							/>
						</div>
					</div>
				))}

				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => appendRoute({ pickup: "", destination: "" })}
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("addRoute")}
				</Button>

				{errors.routes?.root?.message && (
					<p className="text-sm text-destructive">
						{errors.routes.root.message}
					</p>
				)}
			</div>

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
					labelText={t("email")}
					placeholder={t("emailPlaceholder")}
					inputType="email"
					error={errors.email?.message}
					inputProps={{ ...register("email") }}
				/>

				<div>
					<Label className="mb-2">{t("phoneNumber")}</Label>
					<div className="flex gap-2">
						<Controller
							name="phoneCountryCode"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger className="w-[100px] shrink-0">
										<SelectValue>
											{(() => {
												const country = COUNTRY_CODES.find(
													(c) => c.value === field.value,
												);
												const flag = country?.label.split(" ")[0] ?? "";
												return `${flag} ${field.value}`;
											})()}
										</SelectValue>
									</SelectTrigger>
									<SelectContent className="max-h-72">
										{COUNTRY_CODES.map((c) => (
											<SelectItem key={c.value} value={c.value}>
												{c.label} ({c.value})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						<Input
							type="tel"
							inputMode="numeric"
							placeholder={t("phonePlaceholder")}
							className="flex-1"
							{...register("phoneNumber", {
								onChange: (e) => {
									e.target.value = e.target.value.replace(/\D/g, "");
								},
							})}
						/>
					</div>
					{(errors.phoneCountryCode ?? errors.phoneNumber) && (
						<small className="text-xs text-destructive">
							{errors.phoneCountryCode?.message ?? errors.phoneNumber?.message}
						</small>
					)}
				</div>

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
						<div className="space-y-1">
							<Label className="text-sm font-medium">
								{t("numberOfChildren")}
							</Label>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildren",
											Math.max(0, Number(numberOfChildren) - 1),
										)
									}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-8 text-center font-medium tabular-nums">
									{Number(numberOfChildren) || 0}
								</span>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildren",
											Math.min(20, Number(numberOfChildren) + 1),
										)
									}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{errors.numberOfChildren?.message && (
								<p className="text-xs text-destructive">
									{errors.numberOfChildren.message}
								</p>
							)}
						</div>
						{childrenAgeFields.map((field, index) => (
							<div key={field.id} className="space-y-1">
								<Label className="text-sm font-medium">
									{t("childAge", { n: index + 1 })}
								</Label>
								<div className="flex gap-2">
									<Input
										type="text"
										inputMode="numeric"
										placeholder="0"
										className="w-20"
										{...register(`childrenAges.${index}.age`, {
											onChange: (e) => {
												e.target.value = e.target.value.replace(/\D/g, "");
											},
										})}
									/>
									<Controller
										name={`childrenAges.${index}.unit`}
										control={control}
										render={({ field: unitField }) => (
											<Select
												value={unitField.value}
												onValueChange={unitField.onChange}
											>
												<SelectTrigger className="w-28">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="years">{t("ageYears")}</SelectItem>
													<SelectItem value="months">
														{t("ageMonths")}
													</SelectItem>
													<SelectItem value="days">{t("ageDays")}</SelectItem>
												</SelectContent>
											</Select>
										)}
									/>
								</div>
								{errors.childrenAges?.[index]?.age?.message && (
									<p className="text-xs text-destructive">
										{errors.childrenAges[index].age.message}
									</p>
								)}
							</div>
						))}
						<div className="space-y-1">
							<Label className="text-sm font-medium">
								{t("numberOfChildSeats")}
							</Label>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildSeats",
											Math.max(0, Number(watch("numberOfChildSeats")) - 1),
										)
									}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-8 text-center font-medium tabular-nums">
									{Number(watch("numberOfChildSeats")) || 0}
								</span>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setValue(
											"numberOfChildSeats",
											Math.min(20, Number(watch("numberOfChildSeats")) + 1),
										)
									}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{errors.numberOfChildSeats?.message && (
								<p className="text-xs text-destructive">
									{errors.numberOfChildSeats.message}
								</p>
							)}
						</div>
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

			<Button
				type="submit"
				disabled={createRequest.isPending}
				className="w-full"
			>
				{createRequest.isPending ? t("submitting") : t("submitRequest")}
			</Button>

			{createRequest.error && (
				<p className="text-sm text-destructive">
					{createRequest.error.message}
				</p>
			)}
		</form>
	);
}
