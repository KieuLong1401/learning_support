import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Context from "./Context";

export default function Project(
    {
        name,
        folder = null,
        handleDelete,
    } : {
        name: string
        folder?: string | null
        handleDelete: (parents: string | null, nameToDelete: string, type: 'project') => void
    }
) {
    const pathname = usePathname()
    const path = "/" + (folder ? `${folder}/${name}` : name)
    const isActive = pathname === path

    return (
        <Context context_menu_item={[{name: 'delete', callback: () => handleDelete(folder, name, 'project')}]}>
            <Link href={path} className="w-full">
                <Button
                    variant={isActive ? "outline" : "ghost"}
                    className="block w-full justify-start px-2 pb-3 pt-1 h-8 overflow-hidden text-ellipsis whitespace-nowrap text-left"
                    >
                    {name}
                </Button>
            </Link>
        </Context>
    )
}