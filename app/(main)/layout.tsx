export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <main className="pt-20 min-h-screen">{children}</main>;
}
