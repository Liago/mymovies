'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const navLinks = [
		{ name: 'Home', href: '/' },
		{ name: 'Movies', href: '/discovery' },
		{ name: 'TV Shows', href: '/tv' },
		{ name: 'My List', href: '/mylist' },
	];

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
				}`}
		>
			<div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-1 z-50">
					<span className="text-2xl font-bold tracking-tighter text-white">CINE</span>
					<span className="text-2xl font-bold tracking-tighter text-purple-500">SCOPE</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-8">
					{navLinks.map((link) => (
						<Link
							key={link.name}
							href={link.href}
							className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
						>
							{link.name}
						</Link>
					))}
				</div>

				{/* Actions */}
				<div className="hidden md:flex items-center gap-4">
					<div className="w-64">
						<SearchBar />
					</div>
					<div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
						AZ
					</div>
				</div>

				{/* Mobile Menu Button */}
				<button
					className="md:hidden text-white z-50"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>

				{/* Mobile Menu Overlay */}
				{isMobileMenuOpen && (
					<div className="fixed inset-0 bg-slate-950 z-40 flex flex-col items-center justify-center gap-8 md:hidden">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								href={link.href}
								className="text-2xl font-bold text-white"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{link.name}
							</Link>
						))}
					</div>
				)}
			</div>
		</nav>
	);
}
