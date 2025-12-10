'use client';

import Link from 'next/link';
import { Menu, X, Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const navLinks = [
		{ name: 'Home', href: '/' },
		{ name: 'Movies', href: '/movies' },
		{ name: 'TV Shows', href: '/tv' },
		{ name: 'New Releases', href: '/new-releases' },
	];

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
					? 'bg-black/60 backdrop-blur-xl border-white/5 py-3'
					: 'bg-transparent border-transparent py-6'
					}`}
			>
				<div className="max-w-[1920px] mx-auto px-6 md:px-12 flex items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-1 z-50 group">
						<div className="relative">
							<div className="absolute -inset-2 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-500" />
							<span className="relative text-2xl md:text-3xl font-bold tracking-tighter text-white">
								CINE<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">SCOPE</span>
							</span>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-10">
						{navLinks.map((link) => (
							<Link
								key={link.name}
								href={link.href}
								className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide relative group"
							>
								{link.name}
								<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
							</Link>
						))}
					</div>

					{/* Actions */}
					<div className="hidden md:flex items-center gap-5">
						{/* Search Button */}
						<button
							onClick={() => setIsSearchOpen(true)}
							className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 hover:border-primary/30"
							aria-label="Open search"
						>
							<Search size={18} />
						</button>

						{/* Notifications */}
						<button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 relative">
							<Bell size={18} />
							<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
						</button>

						{/* User Avatar */}
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white hover:border-primary/50 transition-colors cursor-pointer shadow-lg shadow-black/50">
							AZ
						</div>
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center gap-3">
						<button
							onClick={() => setIsSearchOpen(true)}
							className="p-2 text-white"
							aria-label="Open search"
						>
							<Search size={22} />
						</button>
						<button
							className="text-white z-50 p-2"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						>
							{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>

					{/* Mobile Menu Overlay */}
					<div className={`fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
						{navLinks.map((link) => (
							<Link
								key={link.name}
								href={link.href}
								className="text-3xl font-bold text-white hover:text-primary transition-colors"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{link.name}
							</Link>
						))}
					</div>
				</div>
			</nav>

			{/* Search Overlay */}
			<SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
		</>
	);
}
