import Spinner from '@/components/Spinner';

export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center pt-20">
			<Spinner size={40} />
		</div>
	);
}
