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
        handleDelete: (parents: string[], nameToDelete: string) => void
        handleCreateProject: (parents: string[], type: "folder" | "project") => void
    }
) {
    return (
        <Context context_menu_item={[{name: 'delete', callback: () => handleDelete([], name)}, {name: 'new project', callback: () => handleCreateProject([name], 'project')}]}>
            <Accordion type="single" collapsible className="w-full" key={name}>
                <AccordionItem value={name}>
                    <AccordionTrigger className="flex justify-between items-center px-4 py-2 text-left w-full hover:bg-gray-100 rounded-md h-8">
                        {name}
                    </AccordionTrigger>
                    <AccordionContent className="ml-4 border-l border-black p-0">
                        {folder_children.map((child) => (
                            <Project name={child.name} folder={name} key={name + child.name} handleDelete={() => handleDelete([name], child.name)}/>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Context>
    )
}