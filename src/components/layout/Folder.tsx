import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import Context from "./Context";
import Project from "./Project";

export default function Folder(
    {
        folder_children,
        name
    }: {
        folder_children: {name: string}[]
        name: string
    }
) {
    return (
        <Context context_menu_item={['new project', 'delete']}>
            <Accordion type="single" collapsible className="w-full" key={name}>
                <AccordionItem value={name}>
                    <AccordionTrigger className="flex justify-between items-center px-4 py-2 text-left w-full">
                        <span>{name}</span>
                    </AccordionTrigger>
                    <AccordionContent className="ml-4">
                        {folder_children.map((child) => (
                            <Project name={child.name} folder={name} key={name + child.name} />
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Context>
    )
}