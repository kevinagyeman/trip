"use client";

import { SectionCard } from "@/app/_components/ui/section-card";
import { LANGUAGE_LABELS } from "@/lib/constants";
import { Globe, Mail, MessageCircle, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";

interface ContactDetailsCardProps {
	email: string;
	phone: string;
	firstName: string;
	lastName: string;
	language: string;
	whatsappHref?: string;
	callLabel?: string;
}

export function ContactDetailsCard({
	email,
	phone,
	firstName,
	lastName,
	language,
	whatsappHref,
}: ContactDetailsCardProps) {
	const t = useTranslations("requestDetail");

	return (
		<SectionCard
			title={t("contactDetails")}
			contentClassName="space-y-1.5 pt-0 text-sm"
		>
			<p className="flex items-center gap-2  text-base">
				<User className="h-4 w-4 shrink-0 text-muted-foreground" />
				<span className="font-medium">
					{firstName} {lastName}
				</span>
			</p>
			<p className="flex items-center gap-2  text-base">
				<Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
				<span className="font-medium">{email}</span>
			</p>
			<div className="flex flex-wrap items-center gap-2  text-base">
				<Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
				<span className="font-medium">{phone}</span>
				{whatsappHref && (
					<>
						<a
							href={whatsappHref}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-green-700"
						>
							<MessageCircle className="h-3 w-3" />
							WhatsApp
						</a>
						<a
							href={`tel:${phone}`}
							className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-blue-700"
						>
							<Phone className="h-3 w-3" />
							{t("call")}
						</a>
					</>
				)}
			</div>
			<p className="flex items-center gap-2  text-base">
				<Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
				<span className="font-medium">
					{LANGUAGE_LABELS[language] ?? language}
				</span>
			</p>
		</SectionCard>
	);
}
