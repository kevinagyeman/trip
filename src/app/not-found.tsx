export default function RootNotFound() {
	return (
		<html lang="en">
			<body
				style={{
					display: "flex",
					minHeight: "100vh",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: "24px",
					padding: "32px",
					textAlign: "center",
					fontFamily: "sans-serif",
				}}
			>
				<p
					style={{
						fontSize: "8rem",
						fontWeight: 900,
						lineHeight: 1,
						margin: 0,
					}}
				>
					404
				</p>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					<h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: 0 }}>
						Page Not Found
					</h1>
					<p style={{ color: "#6b7280", margin: 0 }}>
						Oops! The page you&apos;re looking for has gone on a different trip.
					</p>
				</div>
				<a
					href="/"
					style={{
						background: "#000",
						color: "#fff",
						padding: "10px 24px",
						borderRadius: "6px",
						textDecoration: "none",
						fontSize: "14px",
						fontWeight: 500,
					}}
				>
					Back to Home
				</a>
			</body>
		</html>
	);
}
