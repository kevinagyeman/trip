"use client";

import { AppDialog } from "@/app/_components/ui/app-dialog";
import CustomInput from "@/app/_components/ui/custom-input";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { PhoneInput } from "@/app/_components/ui/phone-input";
import { SectionCard } from "@/app/_components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { driverSchema, type DriverFormValues } from "@/lib/schemas/driver";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RequiredLabel } from "../ui/required-label";

const defaultValues: DriverFormValues = {
	name: "",
	surname: "",
	phoneCountryCode: "+39",
	phoneNumber: "",
	email: "",
};

export function DriversManager() {
	const t = useTranslations("drivers");
	const utils = api.useUtils();
	const { data: drivers = [], isLoading } = api.driver.getAll.useQuery();

	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<DriverFormValues>({
		resolver: zodResolver(driverSchema),
		defaultValues,
	});

	const createDriver = api.driver.create.useMutation({
		onSuccess: async () => {
			await utils.driver.getAll.invalidate();
			handleClose();
		},
	});

	const updateDriver = api.driver.update.useMutation({
		onSuccess: async () => {
			await utils.driver.getAll.invalidate();
			handleClose();
		},
	});

	const deleteDriver = api.driver.delete.useMutation({
		onSuccess: async () => {
			await utils.driver.getAll.invalidate();
		},
	});

	function handleClose() {
		setOpen(false);
		setEditingId(null);
		reset(defaultValues);
	}

	function openCreate() {
		reset(defaultValues);
		setEditingId(null);
		setOpen(true);
	}

	function openEdit(d: (typeof drivers)[0]) {
		const match = d.phone.match(/^(\+\d+)\s(.+)$/);
		reset({
			name: d.name,
			surname: d.surname,
			phoneCountryCode: match?.[1] ?? "+39",
			phoneNumber: match?.[2] ?? d.phone,
			email: d.email,
		});
		setEditingId(d.id);
		setOpen(true);
	}

	function onSubmit(values: DriverFormValues) {
		const phone = `${values.phoneCountryCode} ${values.phoneNumber}`;
		const payload = {
			name: values.name,
			surname: values.surname,
			phone,
			email: values.email,
		};
		if (editingId) {
			updateDriver.mutate({ id: editingId, ...payload });
		} else {
			createDriver.mutate(payload);
		}
	}

	const isSaving = createDriver.isPending || updateDriver.isPending;

	return (
		<SectionCard title={t("title")} subtitle={t("subtitle")}>
			<Button onClick={openCreate} size="sm">
				<Plus className="h-4 w-4" />
				{t("addDriver")}
			</Button>

			{isLoading && (
				<div className="space-y-2 mt-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-lg border p-3"
						>
							<div className="space-y-1.5">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-48" />
							</div>
							<div className="flex gap-2">
								<Skeleton className="h-8 w-8 rounded-md" />
								<Skeleton className="h-8 w-8 rounded-md" />
							</div>
						</div>
					))}
				</div>
			)}

			<div className="space-y-2 mt-4">
				{drivers.map((d) => (
					<div
						className="border rounded-lg p-4 flex items-center justify-between gap-4"
						key={d.id}
					>
						<div>
							<p className="font-semibold">{`${d.name} ${d.surname}`}</p>
							<p className="text-muted-foreground text-sm">{d.phone}</p>
							<p className="text-muted-foreground text-sm">{d.email}</p>
						</div>
						<div className="mt-2 flex gap-1">
							<Button
								size="icon-sm"
								variant="outline"
								onClick={() => openEdit(d)}
							>
								<Pencil />
							</Button>
							<LoadingButton
								size="icon-sm"
								variant="error"
								isLoading={
									deleteDriver.isPending && deleteDriver.variables?.id === d.id
								}
								onClick={() => deleteDriver.mutate({ id: d.id })}
							>
								<Trash2 />
							</LoadingButton>
						</div>
					</div>
				))}
			</div>

			<AppDialog
				open={open}
				onOpenChange={(v) => {
					if (!v) handleClose();
				}}
				title={editingId ? t("editDriver") : t("addDriver")}
				onSave={() => handleSubmit(onSubmit)()}
				isLoading={isSaving}
			>
				<div className="space-y-3">
					<CustomInput
						required
						labelText={t("name")}
						error={errors.name?.message}
						inputProps={{ ...register("name") }}
					/>
					<CustomInput
						required
						labelText={t("surname")}
						error={errors.surname?.message}
						inputProps={{ ...register("surname") }}
					/>
					<div className="col-span-full space-y-1">
						<Label className="text-xs">
							{t("phone")} <RequiredLabel />
						</Label>
						<PhoneInput
							countryCode={watch("phoneCountryCode")}
							onCountryCodeChange={(v) => setValue("phoneCountryCode", v)}
							phoneNumber={watch("phoneNumber")}
							onPhoneNumberChange={(v) => setValue("phoneNumber", v)}
							error={
								errors.phoneCountryCode?.message ?? errors.phoneNumber?.message
							}
						/>
						{(errors.phoneCountryCode ?? errors.phoneNumber) && (
							<small className="text-xs text-destructive">
								{errors.phoneCountryCode?.message ??
									errors.phoneNumber?.message}
							</small>
						)}
					</div>
					<CustomInput
						required
						className="col-span-full"
						labelText={t("email")}
						inputType="email"
						error={errors.email?.message}
						inputProps={{ ...register("email") }}
					/>
				</div>
			</AppDialog>
		</SectionCard>
	);
}
