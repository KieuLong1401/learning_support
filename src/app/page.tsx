import {
	Atom,
	BookMarked,
	BrainCog,
	Notebook,
	Pyramid,
	Sun,
} from 'lucide-react'

export default function Home() {
	return (
		<div className='flex flex-col items-center justify-center w-full h-screen'>
			<Pyramid
				size={300}
				color='rgba(235, 235, 235, 1)'
			/>
			<div className='flex flex-row gap-2 mt-4'>
				<Sun />
				<BrainCog />
				<BookMarked />
				<Atom />
				<Notebook />
			</div>
		</div>
	)
}
