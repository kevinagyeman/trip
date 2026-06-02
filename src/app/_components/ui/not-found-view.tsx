import { PageCenter } from "@/app/_components/ui/page-center";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotFoundViewProps {
	heading: string;
	description: string;
	backHome: string;
}

export function NotFoundView({
	heading,
	description,
	backHome,
}: NotFoundViewProps) {
	return (
		<PageCenter className="flex-col gap-6 p-8 text-center">
			<p className="text-9xl font-medium tracking-tighter text-primary">404</p>
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">{heading}</h1>
				<p className="text-muted-foreground">{description}</p>
			</div>
			<Link href="/">
				<Button size="lg">{backHome}</Button>
			</Link>
		</PageCenter>
	);
}
