import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Context from "./Context";

export default function Project(
    {
        name,
        folder,
        handleDelete
    } : {
        name: string
        folder?: string
        handleDelete: (parents: string[], nameToDelete: string) => void
    }
) {
    const pathname = usePathname()
    const path = "/" + (folder ? `${folder}/${name}` : name)
    const isActive = pathname === path

    return (
        <Context context_menu_item={[{name: 'delete', callback: () => handleDelete(folder ? [folder] : [], name)}]}>
            <Link href={path} className="w-full">
                <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start px-4 h-8"
                    >
                    {name}
                </Button>
            </Link>
        </Context>
    )
}