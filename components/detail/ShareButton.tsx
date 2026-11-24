'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Link2, Mail, Send, Share2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ShareButtonProps {
	title: string;
	mediaType: 'movie' | 'tv';
	/** Classi del pulsante, per adattarlo all'hero o alla riga mobile. */
	className?: string;
	iconSize?: number;
	/** Testo accanto all'icona (solo hero desktop). */
	label?: string;
	/** Direzione del menu: `up` dentro l'hero (che ha overflow nascosto). */
	placement?: 'up' | 'down';
}

interface Channel {
	key: string;
	label: string;
	icon: React.ReactNode;
	href: (url: string, text: string) => string;
}

function Glyph({ children }: { children: string }) {
	return (
		<span aria-hidden className="w-[18px] h-[18px] flex items-center justify-center text-[13px] font-extrabold leading-none">
			{children}
		</span>
	);
}

const CHANNELS: Channel[] = [
	{
		key: 'whatsapp',
		label: 'WhatsApp',
		icon: <Glyph>W</Glyph>,
		href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
	},
	{
		key: 'telegram',
		label: 'Telegram',
		icon: <Send size={17} />,
		href: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
	},
	{
		key: 'x',
		label: 'X',
		icon: <Glyph>𝕏</Glyph>,
		href: (url, text) => `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
	},
	{
		key: 'facebook',
		label: 'Facebook',
		icon: <Glyph>f</Glyph>,
		href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
	},
	{
		key: 'email',
		label: 'Email',
		icon: <Mail size={17} />,
		href: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
	},
];

function currentUrl(): string {
	return `${window.location.origin}${window.location.pathname}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback per browser senza Clipboard API o contesti non sicuri
		const ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.position = 'fixed';
		ta.style.opacity = '0';
		document.body.appendChild(ta);
		ta.select();
		const ok = document.execCommand('copy');
		document.body.removeChild(ta);
		return ok;
	}
}

/**
 * Condivide la scheda del titolo: usa il pannello di sistema (Web Share API)
 * dove disponibile, altrimenti mostra un menu con i canali più comuni e
 * "Copia link".
 */
export default function ShareButton({ title, mediaType, className, iconSize = 18, label, placement = 'down' }: ShareButtonProps) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const text = `${title} – ${mediaType === 'movie' ? 'guarda questo film' : 'guarda questa serie'} su CineScope`;

	useEffect(() => {
		if (!open) return;
		const onPointer = (e: PointerEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	useEffect(() => {
		if (!copied) return;
		const t = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(t);
	}, [copied]);

	const handleClick = useCallback(async () => {
		const url = currentUrl();
		if (typeof navigator.share === 'function') {
			try {
				await navigator.share({ title, text, url });
				return;
			} catch (e) {
				// Annullato dall'utente: niente menu. Altri errori: si ripiega sul menu.
				if (e instanceof DOMException && e.name === 'AbortError') return;
			}
		}
		setOpen((v) => !v);
	}, [title, text]);

	const handleCopy = async () => {
		if (await copyToClipboard(currentUrl())) setCopied(true);
	};

	return (
		<div ref={rootRef} className="relative">
			<button
				type="button"
				onClick={handleClick}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label="Condividi"
				title="Condividi"
				className={className}
			>
				<Share2 size={iconSize} />
				{label}
			</button>

			{open && (
				<div
					role="menu"
					className={cn(
						'absolute right-0 z-50 w-[220px] p-1.5 rounded-[16px] bg-card border border-line shadow-xl flex flex-col text-fg',
						placement === 'up' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
					)}
				>
					{CHANNELS.map((c) => (
						<a
							key={c.key}
							role="menuitem"
							href={c.href(currentUrl(), text)}
							target={c.key === 'email' ? undefined : '_blank'}
							rel="noopener noreferrer"
							onClick={() => setOpen(false)}
							className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-semibold hover:bg-bg2 transition-colors"
						>
							<span className="text-fg2">{c.icon}</span>
							{c.label}
						</a>
					))}
					<div className="h-px bg-line my-1" />
					<button
						type="button"
						role="menuitem"
						onClick={handleCopy}
						className={cn(
							'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-semibold text-left hover:bg-bg2 transition-colors',
							copied && 'text-acc'
						)}
					>
						<span className={copied ? 'text-acc' : 'text-fg2'}>{copied ? <Check size={17} /> : <Link2 size={17} />}</span>
						{copied ? 'Link copiato!' : 'Copia link'}
					</button>
				</div>
			)}
		</div>
	);
}
