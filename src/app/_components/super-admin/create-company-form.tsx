"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { LoadingButton } from "@/app/_components/ui/loading-button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function CreateCompanyForm() {
	const t = useTranslations("superAdmin");
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	const createCompany = api.company.create.useMutation({
		onSuccess: (company) => {
			router.push(`/super-admin/companies/${company.id}`);
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		const form = e.currentTarget;
		const data = new FormData(form);

		createCompany.mutate({
			name: data.get("name") as string,
			slug: data.get("slug") as string,
			logoUrl: (data.get("logoUrl") as string) || undefined,
		});
	}

	return (
		<Card>
			<CardContent className="pt-6">
				<form onSubmit={handleSubmit} className="space-y-4">
					<input
						name="name"
						required
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						placeholder={t("companyName")}
					/>

					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">/</span>
						<input
							name="slug"
							required
							pattern="[a-z0-9-]+"
							className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
							placeholder="my-company"
						/>
					</div>
					<p className="text-xs text-muted-foreground">{t("slugHint")}</p>

					<input
						name="logoUrl"
						type="url"
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="https://..."
					/>

					{error && (
						<p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}

					<LoadingButton
						type="submit"
						isLoading={createCompany.isPending}
						className="w-full"
						variant="default"
					>
						{t("createCompany")}
					</LoadingButton>
				</form>
			</CardContent>
		</Card>
	);
}
