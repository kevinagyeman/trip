"use client";

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
import { AIRPORTS, LANGUAGES } from "@/lib/airports";
import { COUNTRY_CODES } from "@/lib/phone";
import {
	createTripRequestSchema,
	type CreateTripRequestFormValues,
} from "@/lib/schemas/trip-request";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Plus, X } from "lucide-react";
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
					? values.childrenAges.map((c) => c.age).join(", ")
					: undefined,
			numberOfChildSeats: values.areThereChildren
				? values.numberOfChildSeats
				: undefined,
			additionalInfo: values.additionalInfo || undefined,
		});
	};

	const duplicateRoute = (index: number) => {
		const current = getValues(`routes.${index}`);
		appendRoute({ pickup: current.pickup, destination: current.destination });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Route boxes */}
			<div className="space-y-3">
				<h3 className="text-lg font-semibold">{t("routes")}</h3>

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
								{AIRPORTS.map((airport) => (
									<Button
										key={airport.value}
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											setValue(`routes.${index}.pickup`, airport.label)
										}
									>
										{airport.value}
									</Button>
								))}
							</div>
						</div>

						{/* Destination */}
						<div className="space-y-2">
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
								{AIRPORTS.map((airport) => (
									<Button
										key={airport.value}
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											setValue(`routes.${index}.destination`, airport.label)
										}
									>
										{airport.value}
									</Button>
								))}
							</div>
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
							placeholder={t("phonePlaceholder")}
							className="flex-1"
							{...register("phoneNumber")}
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
						<CustomInput
							labelText={t("numberOfChildren")}
							inputType="number"
							error={errors.numberOfChildren?.message}
							inputProps={{ ...register("numberOfChildren"), min: 0, max: 20 }}
						/>
						{childrenAgeFields.map((field, index) => (
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
