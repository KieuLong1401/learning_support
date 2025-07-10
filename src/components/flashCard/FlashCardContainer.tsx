import { Dispatch, useState } from 'react'
import { Button } from '../ui/button'
import FlashCardModal from './FlashCardModal'
import FlashCard, { IFlashCard } from './FlashCard'
import { IDocument } from '../layout/Sidebar'
import FlashCardViewer from './FlashCardViewer'

export default function FlashCardContainer({
	flashCardData,
	documentData: documentData,
	setDocumentData: setDocumentData,
}: {
	flashCardData: IFlashCard[]
	documentData: IDocument | undefined
	setDocumentData: Dispatch<React.SetStateAction<IDocument | undefined>>
}) {
	const [openModal, setOpenModal] = useState(false)
	const [openShow, setOpenShow] = useState(false)

	return (
		<div className='flex flex-col flex-1 overflow-hidden'>
			<Button
				variant={'outline'}
				onClick={() => setOpenShow(true)}
				className='mb-2'
			>
				Flashcards Viewer
			</Button>
			<Button
				onClick={() => setOpenModal(true)}
				className='mb-4'
			>
				Create new flash card
			</Button>
			<div className='flex-1 overflow-auto'>
				<div className='grid gap-4 grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]'>
					{flashCardData.map((e, i) => {
						return (
							<FlashCard
								key={i}
								data={e}
								documentData={documentData}
								setDocumentData={setDocumentData}
							/>
						)
					})}
				</div>
			</div>
			{/* alter change text for modify modal */}
			<FlashCardModal
				open={openModal}
				onOpenChange={setOpenModal}
				documentData={documentData}
				setDocumentData={setDocumentData}
			/>
			<FlashCardViewer
				open={openShow}
				onOpenChange={setOpenShow}
				flashCardData={flashCardData}
			/>
		</div>
	)
}
