'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface TMDBUserData {
	id: number;
	username: string;
	name: string;
	avatar: {
		gravatar: { hash: string };
		tmdb: { avatar_path: string | null };
	};
}

interface AuthContextType {
	isLoggedIn: boolean;
	user: TMDBUserData | null;
	avatarUrl: string | null;
	isLoading: boolean;
	hasMounted: boolean;
	login: () => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const cookieValue = parts.pop()?.split(';').shift();
		return cookieValue ? decodeURIComponent(cookieValue) : null;
	}
	return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<TMDBUserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasMounted, setHasMounted] = useState(false);

	// Check for existing session on mount - only run on client
	useEffect(() => {
		setHasMounted(true);

		const checkAuth = () => {
			try {
				const userCookie = getCookie('tmdb_user');
				if (userCookie) {
					const userData = JSON.parse(userCookie);
					setUser(userData);
				}
			} catch (error) {
				console.error('Error parsing user cookie:', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	const login = useCallback(async () => {
		try {
			setIsLoading(true);

			// Call our API to get the authorization URL
			const response = await fetch('/api/auth/tmdb');
			const data = await response.json();

			if (data.authUrl) {
				// Redirect to TMDB for authorization
				window.location.href = data.authUrl;
			} else {
				console.error('Failed to get auth URL:', data.error);
				setIsLoading(false);
			}
		} catch (error) {
			console.error('Login error:', error);
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			setIsLoading(true);

			await fetch('/api/auth/tmdb/logout', { method: 'POST' });

			setUser(null);
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const avatarUrl = user ? (() => {
		if (user.avatar.tmdb.avatar_path) {
			return `https://image.tmdb.org/t/p/w200${user.avatar.tmdb.avatar_path}`;
		}
		if (user.avatar.gravatar.hash) {
			return `https://www.gravatar.com/avatar/${user.avatar.gravatar.hash}`;
		}
		return null;
	})() : null;

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: !!user,
				user,
				avatarUrl,
				isLoading,
				hasMounted,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

