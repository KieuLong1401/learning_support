import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '../ui/accordion'
import Context from './Context'
import Project from './Project'

export default function Folder({
	folder_children,
	name,
	handleDelete,
	handleDeleteProject,
	handleCreateProject,
}: {
	folder_children: {
		name: string
	}[]
	name: string
	handleDelete: (name: string) => void
	handleDeleteProject: (folder: string | null, name: string) => void
	handleCreateProject: (folder: string | null) => void
}) {
	return (
		<Context
			context_menu_item={[
				{
					name: 'delete',
					callback: () => handleDelete(name),
				},
				{
					name: 'new project',
					callback: () => handleCreateProject(name),
				},
			]}
		>
			<Accordion
				type='single'
				collapsible
				className='w-full'
			>
				<AccordionItem value={name}>
					<AccordionTrigger className='flex justify-between items-center px-2 pb-3 pt-1 text-left w-full hover:bg-gray-100 rounded-md h-8'>
						<span className='block w-full h-full overflow-hidden text-ellipsis whitespace-nowrap'>
							{name}
						</span>
					</AccordionTrigger>
					<AccordionContent className='ml-4 border-l border-black p-0'>
						{folder_children.map((project) => (
							<Project
								key={name + project.name}
								name={project.name}
								folder={name}
								handleDelete={handleDeleteProject}
							/>
						))}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Context>
	)
}
