import ConditionalLayout from "@/components/ConditionalLayout";

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <ConditionalLayout>{children}</ConditionalLayout>;
}
