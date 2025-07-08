import { Dispatch, useState } from 'react'
import { Button } from '../ui/button'
import FlashCardModal from './FlashCardModal'
import FlashCard, { IFlashCard } from './FlashCard'
import { IProject } from '../layout/Sidebar'

export default function FlashCardContainer({
	flashCardData,
	projectData,
	setProjectData,
}: {
	flashCardData: IFlashCard[]
	projectData: IProject | undefined
	setProjectData: Dispatch<React.SetStateAction<IProject | undefined>>
}) {
	const [openModal, setOpenModal] = useState(false)

	return (
		<div className='flex flex-col flex-1 overflow-hidden'>
			<Button
				onClick={() => setOpenModal(true)}
				className='mb-4'
			>
				Create new flash card
			</Button>
			<div className='flex-1 overflow-auto'>
				<div className='grid gap-4 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]'>
					{flashCardData.map((e, i) => {
						return (
							<FlashCard
								key={i}
								data={e}
								projectData={projectData}
								setProjectData={setProjectData}
							/>
						)
					})}
				</div>
			</div>
			<FlashCardModal
				open={openModal}
				onOpenChange={setOpenModal}
				projectData={projectData}
				setProjectData={setProjectData}
			/>
		</div>
	)
}
