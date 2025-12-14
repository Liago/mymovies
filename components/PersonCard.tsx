'use client';

import { useState, useEffect } from 'react';
import { fetchPersonDetailsById } from '@/app/actions';
import { User, X, Calendar, MapPin, Briefcase, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PersonCardProps {
	personId?: number;
	name: string;
	role: string;
	profilePath?: string;
}

export default function PersonCard({ personId, name, role, profilePath }: PersonCardProps) {
	const [personDetails, setPersonDetails] = useState<any>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen && personId && !personDetails) {
			setLoading(true);
			fetchPersonDetailsById(personId).then((data) => {
				setPersonDetails(data);
				setLoading(false);
			});
		}
	}, [isOpen, personId, personDetails]);

	const handleOpen = () => {
		if (personId) {
			setIsOpen(true);
		}
	};

	const imageUrl = profilePath
		? `https://image.tmdb.org/t/p/w200${profilePath}`
		: personDetails?.profilePath;

	const formatDate = (dateString: string | null) => {
		if (!dateString) return null;
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	};

	const calculateAge = (birthday: string, deathday?: string | null) => {
		const birthDate = new Date(birthday);
		const endDate = deathday ? new Date(deathday) : new Date();
		let age = endDate.getFullYear() - birthDate.getFullYear();
		const monthDiff = endDate.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	const getGenderLabel = (gender: number) => {
		switch (gender) {
			case 1: return 'Female';
			case 2: return 'Male';
			case 3: return 'Non-binary';
			default: return 'Not specified';
		}
	};

	return (
		<>
			<div
				onClick={handleOpen}
				className={`flex flex-col items-center min-w-[100px] ${personId ? 'cursor-pointer' : 'cursor-default'} group`}
			>
				<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-primary/50 transition-all shadow-lg bg-zinc-900">
					{imageUrl ? (
						<img src={imageUrl} alt={name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
					) : (
						<div className="w-full h-full flex items-center justify-center text-zinc-600 group-hover:text-zinc-400">
							<User size={28} />
						</div>
					)}
				</div>
				<span className="text-sm font-semibold text-zinc-300 text-center group-hover:text-white transition-colors line-clamp-2">{name}</span>
				<span className="text-xs text-zinc-500">{role}</span>
			</div>

			{/* Enhanced Modal */}
			{isOpen && personId && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
					<div className="bg-zinc-950 border border-white/10 w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
						{loading ? (
							<div className="flex justify-center items-center p-12 min-h-[400px]">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
							</div>
						) : personDetails ? (
							<>
								{/* Header with close button */}
								<div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 sticky top-0 z-10">
									<h2 className="text-2xl font-bold text-white">{personDetails.name}</h2>
									<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
										<X size={24} />
									</button>
								</div>

								<div className="overflow-y-auto bg-zinc-950/50 custom-scrollbar">
									{/* Profile Section */}
									<div className="p-6 md:p-8">
										<div className="grid md:grid-cols-[300px,1fr] gap-8">
											{/* Left Column - Profile Image & Basic Info */}
											<div className="space-y-6">
												<div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10">
													{personDetails.profilePath ? (
														<img
															src={personDetails.profilePath}
															alt={personDetails.name}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-zinc-700">
															<User size={80} />
														</div>
													)}
												</div>

												{/* Personal Information */}
												<div className="space-y-4 bg-zinc-900/50 rounded-xl p-5 border border-white/10">
													<h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Personal Info</h3>

													{personDetails.knownForDepartment && (
														<div className="flex items-start gap-3">
															<Briefcase size={18} className="text-primary mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-xs text-zinc-500">Known For</p>
																<p className="text-sm text-white font-medium">{personDetails.knownForDepartment}</p>
															</div>
														</div>
													)}

													{personDetails.gender > 0 && (
														<div className="flex items-start gap-3">
															<User size={18} className="text-primary mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-xs text-zinc-500">Gender</p>
																<p className="text-sm text-white font-medium">{getGenderLabel(personDetails.gender)}</p>
															</div>
														</div>
													)}

													{personDetails.birthday && (
														<div className="flex items-start gap-3">
															<Calendar size={18} className="text-primary mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-xs text-zinc-500">Birthday</p>
																<p className="text-sm text-white font-medium">
																	{formatDate(personDetails.birthday)}
																	{personDetails.birthday && !personDetails.deathday && (
																		<span className="text-zinc-500 ml-2">
																			({calculateAge(personDetails.birthday)} years old)
																		</span>
																	)}
																</p>
															</div>
														</div>
													)}

													{personDetails.deathday && (
														<div className="flex items-start gap-3">
															<Calendar size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-xs text-zinc-500">Died</p>
																<p className="text-sm text-white font-medium">
																	{formatDate(personDetails.deathday)}
																	{personDetails.birthday && (
																		<span className="text-zinc-500 ml-2">
																			(Aged {calculateAge(personDetails.birthday, personDetails.deathday)})
																		</span>
																	)}
																</p>
															</div>
														</div>
													)}

													{personDetails.placeOfBirth && (
														<div className="flex items-start gap-3">
															<MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-xs text-zinc-500">Place of Birth</p>
																<p className="text-sm text-white font-medium">{personDetails.placeOfBirth}</p>
															</div>
														</div>
													)}

													{personDetails.imdbId && (
														<div className="pt-2 border-t border-white/10">
															<a
																href={`https://www.imdb.com/name/${personDetails.imdbId}`}
																target="_blank"
																rel="noopener noreferrer"
																className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
															>
																<ExternalLink size={16} />
																View on IMDb
															</a>
														</div>
													)}
												</div>

												{/* Also Known As */}
												{personDetails.alsoKnownAs && personDetails.alsoKnownAs.length > 0 && (
													<div className="space-y-2 bg-zinc-900/50 rounded-xl p-5 border border-white/10">
														<h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Also Known As</h3>
														<div className="space-y-1">
															{personDetails.alsoKnownAs.slice(0, 5).map((alias: string, index: number) => (
																<p key={index} className="text-sm text-zinc-400">{alias}</p>
															))}
														</div>
													</div>
												)}
											</div>

											{/* Right Column - Biography & Known For */}
											<div className="space-y-8">
												{/* Biography */}
												<div>
													<h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
														<span>Biography</span>
														<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
													</h3>
													<div className="text-zinc-300 leading-relaxed space-y-4">
														{personDetails.biography.split('\n\n').map((paragraph: string, index: number) => (
															<p key={index} className="text-sm md:text-base">{paragraph}</p>
														))}
													</div>
												</div>

												{/* Known For */}
												{personDetails.knownFor && personDetails.knownFor.length > 0 && (
													<div>
														<h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
															<Star size={20} className="text-primary" />
															<span>Known For</span>
															<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
														</h3>
														<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
															{personDetails.knownFor.map((item: any) => (
																<Link
																	href={`/${item.type}/${item.id}`}
																	key={item.id}
																	className="group bg-zinc-900 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:scale-105"
																>
																	<div className="aspect-[2/3] bg-zinc-800 relative">
																		{item.poster ? (
																			<img
																				src={item.poster}
																				alt={item.title}
																				className="w-full h-full object-cover"
																			/>
																		) : (
																			<div className="absolute inset-0 flex items-center justify-center text-zinc-600">
																				No Poster
																			</div>
																		)}
																		{item.voteAverage > 0 && (
																			<div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
																				<Star size={12} className="text-yellow-400 fill-yellow-400" />
																				<span className="text-xs font-bold text-white">{item.voteAverage.toFixed(1)}</span>
																			</div>
																		)}
																	</div>
																	<div className="p-3">
																		<h4 className="font-bold text-sm text-zinc-300 line-clamp-2 group-hover:text-white mb-1">{item.title}</h4>
																		{item.character && item.character !== 'N/A' && (
																			<p className="text-xs text-zinc-500 line-clamp-1 mb-1">as {item.character}</p>
																		)}
																		<p className="text-xs text-zinc-600">{item.year || 'N/A'} • {item.type === 'movie' ? 'Movie' : 'TV'}</p>
																	</div>
																</Link>
															))}
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</>
						) : (
							<div className="flex justify-center items-center p-12 min-h-[400px]">
								<p className="text-zinc-500">Failed to load person details</p>
							</div>
						)}
					</div>
					<div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
				</div>
			)}
		</>
	);
}
