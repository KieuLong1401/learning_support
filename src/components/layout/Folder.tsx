import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import Context from "./Context";
import Project from "./Project";

export default function Folder(
    {
        folder_children,
        name,
        handleDelete,
        handleCreateProject
    }: {
        folder_children: {name: string}[]
        name: string
        handleDelete: (parents: string | null, nameToDelete: string, type: 'project' | 'folder') => void
        handleCreateProject: (parents: string | null, type: "folder" | "project") => void
    }
) {
    return (
        <Context context_menu_item={[{name: 'delete', callback: () => handleDelete(null, name, 'folder')}, {name: 'new project', callback: () => handleCreateProject(name, 'project')}]}>
            <Accordion type="single" collapsible className="w-full" key={name}>
                <AccordionItem value={name}>
                    <AccordionTrigger className="flex justify-between items-center px-2 pb-3 pt-1 text-left w-full hover:bg-gray-100 rounded-md h-8">
                        <span className="block w-full h-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {name}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="ml-4 border-l border-black p-0">
                        {folder_children.map((child) => (
                            <Project name={child.name} folder={name} key={name + child.name} handleDelete={() => handleDelete(name, child.name, 'project')}/>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Context>
    )
}