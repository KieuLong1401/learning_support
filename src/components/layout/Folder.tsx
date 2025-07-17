import { Dispatch, SetStateAction, useState } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'
import Context from './Context'
import Document from './Document'
import { IDocument } from './Sidebar'
import DocumentModal from './DocumentModal'

export default function Folder({
	folder_children,
	name,
	handleDelete,
	handleDeleteDocument,
	handleCreateDocument,
	setDocuments,
	setFolders,
	getNewestDocumentData,
	getNewestFolderData,
}: {
	folder_children: {
		name: string
	}[]
	name: string
	handleDelete: (name: string) => void
	handleDeleteDocument: (folder: string | null, name: string) => void
	handleCreateDocument: (folder: string | null) => void
	setDocuments: Dispatch<SetStateAction<IDocument[]>>
	setFolders: Dispatch<SetStateAction<string[]>>
	getNewestDocumentData: () => any
	getNewestFolderData: () => any
}) {
	const [addModalOpen, setAddModalOpen] = useState(false)

	return (
		<>
			<Context
				context_menu_item={[
					{
						name: 'Delete',
						callback: () => handleDelete(name),
					},
					{
						name: 'New Document',
						callback: () => handleCreateDocument(name),
					},
					{
						name: 'Rename',
						callback: () => setAddModalOpen(true),
					},
				]}
			>
				<Accordion
					type='single'
					collapsible
					className='w-full'
				>
					<AccordionItem value={name}>
						<AccordionTrigger className='hover:no-underline flex justify-between items-center px-4 pb-3 pt-1 text-left w-full hover:bg-gray-100 rounded-md h-8'>
							<span className='block w-full h-full text-ellipsis whitespace-nowrap'>
								{name}
							</span>
						</AccordionTrigger>
						<AccordionContent className='ml-4 border-l border-black p-0'>
							{folder_children.map((document) => (
								<Document
									key={name + document.name}
									name={document.name}
									folder={name}
									handleDelete={handleDeleteDocument}
									setDocuments={setDocuments}
									setFolders={setFolders}
									getNewestDocumentData={
										getNewestDocumentData
									}
									getNewestFolderData={getNewestFolderData}
								/>
							))}
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Context>
			<DocumentModal
				addModalOpen={addModalOpen}
				setAddModalOpen={setAddModalOpen}
				newType={'folder'}
				setDocuments={setDocuments}
				setFolders={setFolders}
				parentFolder={null}
				getNewestDocumentData={getNewestDocumentData}
				getNewestFolderData={getNewestFolderData}
				name={name}
			/>
		</>
	)
}
