import { Pyramid } from 'lucide-react'

export default function Home() {
	return (
		<div className='flex flex-col items-center justify-center w-full h-screen'>
			<Pyramid
				size={400}
				className='text-[var(--foreground)] opacity-10'
			/>
		</div>
	)
}
