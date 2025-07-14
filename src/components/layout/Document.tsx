import Link from 'next/link'
import { Button } from '../ui/button'
import { usePathname } from 'next/navigation'
import Context from './Context'
import DocumentModal from './DocumentModal'
import { Dispatch, SetStateAction, useState } from 'react'
import { IDocument } from './Sidebar'

export default function Document({
	name,
	folder = null,
	handleDelete,
	setDocuments,
    setFolders,
	getNewestDocumentData,
	getNewestFolderData,
}: {
	name: string
	folder?: string | null
	handleDelete: (folder: string | null, name: string) => void
	setDocuments: Dispatch<SetStateAction<IDocument[]>>
    setFolders: Dispatch<SetStateAction<string[]>>
	getNewestDocumentData: () => any
	getNewestFolderData: () => any
}) {
	const [addModalOpen, setAddModalOpen] = useState(false)

	const pathname = usePathname()
	const path = '/' + (folder ? `${folder}/${name}` : name)
	const isActive = decodeURIComponent(pathname) === path

	const handleRename = () => {
		setAddModalOpen(true)
	}

	return (
		<>
			<Context
				context_menu_item={[
					{
						name: 'Delete',
						callback: () => handleDelete(folder, name),
					},
					{
						name: 'Rename',
						callback: () => handleRename()
					}
				]}
				>
				<Link
					href={path}
					className='w-full'
					>
					<Button
						variant={isActive ? 'outline' : 'ghost'}
						className='block w-full justify-start px-4 pb-3 pt-1 h-8 overflow-hidden text-ellipsis whitespace-nowrap text-left'
						>
						{name}
					</Button>
				</Link>
			</Context>
			<DocumentModal
				addModalOpen={addModalOpen} 
				setAddModalOpen={setAddModalOpen} 
				newType={'document'}
				setDocuments={setDocuments} 
				setFolders={setFolders} 
				parentFolder={folder}
				getNewestDocumentData={getNewestDocumentData}
				getNewestFolderData={getNewestFolderData}
				name={name}
			/>
		</>
	)
}
