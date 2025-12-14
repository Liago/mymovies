'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, Bell, LogIn, LogOut, User, Globe, Heart, Bookmark, List } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SearchOverlay from './SearchOverlay';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);
	const langMenuRef = useRef<HTMLDivElement>(null);

	const { isLoggedIn, user, avatarUrl, isLoading, hasMounted, login, logout } = useAuth();
	const { language, setLanguage, t } = useLanguage();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close menus when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const navLinks = [
		{ name: 'Home', href: '/' },
		{ name: 'Trending', href: '/trending' },
		{ name: 'Movies', href: '/movies' },
		{ name: 'TV Shows', href: '/tv' },
		{ name: 'Top Rated', href: '/top-rated' },
		{ name: 'Now Playing', href: '/now-playing' },
		{ name: 'New Releases', href: '/new-releases' },
	];

	const handleLogin = async () => {
		await login();
	};

	const handleLogout = async () => {
		await logout();
		setIsUserMenuOpen(false);
	};

	return (
		<>
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
					? 'bg-black/60 backdrop-blur-xl border-white/5 py-3'
					: 'bg-transparent border-transparent py-6'
					}`}
			>
				<div className="max-w-[1920px] mx-auto px-6 lg:px-12 flex items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-1 z-50 group">
						<div className="relative">
							<div className="absolute -inset-2 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-500" />
							<span className="relative text-2xl lg:text-3xl font-bold tracking-tighter text-white">
								CINE<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">SCOPE</span>
							</span>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden lg:flex items-center gap-10">
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
					<div className="hidden lg:flex items-center gap-5">
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

						{/* User Avatar / Login Button */}
						{!hasMounted || isLoading ? (
							<div className="w-9 h-9 rounded-full bg-gray-800 animate-pulse" />
						) : isLoggedIn && user ? (
							<div className="relative" ref={userMenuRef}>
								<button
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center gap-2 group"
								>
									{avatarUrl ? (
										<Image
											src={avatarUrl}
											alt={user.username}
											width={36}
											height={36}
											className="rounded-full border-2 border-white/10 hover:border-primary/50 transition-colors"
										/>
									) : (
										<div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white hover:border-primary/50 transition-colors cursor-pointer shadow-lg shadow-black/50">
											{user.username.slice(0, 2).toUpperCase()}
										</div>
									)}
								</button>

								{/* Dropdown Menu */}
								{isUserMenuOpen && (
									<div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
										<div className="px-4 py-3 border-b border-white/10">
											<p className="text-sm font-medium text-white">{user.name || user.username}</p>
											<p className="text-xs text-gray-400">@{user.username}</p>
										</div>
										<div className="py-1">
											<Link
												href="/profile"
												className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
												onClick={() => setIsUserMenuOpen(false)}
											>
												<User size={16} />
												Il mio profilo
											</Link>
											<Link
												href="/profile/favorites"
												className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
												onClick={() => setIsUserMenuOpen(false)}
											>
												<Heart size={16} />
												Preferiti
											</Link>
											<Link
												href="/profile/watchlist"
												className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
												onClick={() => setIsUserMenuOpen(false)}
											>
												<Bookmark size={16} />
												Watchlist
											</Link>
											<Link
												href="/profile/lists"
												className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/10"
												onClick={() => setIsUserMenuOpen(false)}
											>
												<List size={16} />
												Le Mie Liste
											</Link>
											<button
												onClick={handleLogout}
												className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
											>
												<LogOut size={16} />
												Esci
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<button
								onClick={handleLogin}
								className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
							>
								<LogIn size={16} />
								Accedi
							</button>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="lg:hidden flex items-center gap-3">
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
					<div className={`fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center gap-8 lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
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

						{/* Mobile Login/Logout */}
						<div className="mt-8 pt-8 border-t border-white/10 w-64 text-center">
							{!hasMounted ? (
								<div className="w-36 h-12 rounded-full bg-gray-800 animate-pulse mx-auto" />
							) : isLoggedIn && user ? (
								<div className="flex flex-col items-center gap-3">
									<div className="text-gray-400 text-sm mb-2">
										Ciao, <span className="text-white">{user.username}</span>
									</div>

									{/* Profile Links */}
									<Link
										href="/profile"
										className="flex items-center gap-3 px-6 py-2.5 text-base text-gray-300 hover:text-white transition-colors w-full"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<User size={18} />
										Il mio profilo
									</Link>
									<Link
										href="/profile/favorites"
										className="flex items-center gap-3 px-6 py-2.5 text-base text-gray-300 hover:text-white transition-colors w-full"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Heart size={18} />
										Preferiti
									</Link>
									<Link
										href="/profile/watchlist"
										className="flex items-center gap-3 px-6 py-2.5 text-base text-gray-300 hover:text-white transition-colors w-full"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Bookmark size={18} />
										Watchlist
									</Link>
									<Link
										href="/profile/lists"
										className="flex items-center gap-3 px-6 py-2.5 text-base text-gray-300 hover:text-white transition-colors w-full mb-2"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<List size={18} />
										Le Mie Liste
									</Link>

									<button
										onClick={() => {
											handleLogout();
											setIsMobileMenuOpen(false);
										}}
										className="flex items-center gap-2 px-6 py-3 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors mt-2"
									>
										<LogOut size={18} />
										Esci
									</button>
								</div>
							) : (
								<button
									onClick={() => {
										handleLogin();
										setIsMobileMenuOpen(false);
									}}
									className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white font-medium hover:opacity-90 transition-opacity mx-auto"
								>
									<LogIn size={18} />
									Accedi con TMDB
								</button>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Search Overlay */}
			<SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
		</>
	);
}

