import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'
import Context from './Context'
import Document from './Document'

export default function Folder({
	folder_children,
	name,
	handleDelete,
	handleDeleteDocument,
	handleCreateDocument,
}: {
	folder_children: {
		name: string
	}[]
	name: string
	handleDelete: (name: string) => void
	handleDeleteDocument: (folder: string | null, name: string) => void
	handleCreateDocument: (folder: string | null) => void
}) {
	return (
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
			]}
		>
			<Accordion
				type='single'
				collapsible
				className='w-full'
			>
				<AccordionItem value={name}>
					<AccordionTrigger className='flex justify-between items-center px-4 pb-3 pt-1 text-left w-full hover:bg-gray-100 rounded-md h-8'>
						<span className='block w-full h-full overflow-hidden text-ellipsis whitespace-nowrap'>
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
							/>
						))}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Context>
	)
}
