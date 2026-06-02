import { NotFoundView } from "@/app/_components/ui/not-found-view";

export default function RootNotFound() {
	return (
		<NotFoundView
			heading="Page Not Found"
			description="Oops! The page you're looking for has gone on a different trip."
			backHome="Back to Home"
		/>
	);
}
