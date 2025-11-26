import Sidebar from "@/components/Sidebar";

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-[#fdfbf7]">
			<Sidebar />
			<div className="pl-20">
				{children}
			</div>
		</div>
	);
}
