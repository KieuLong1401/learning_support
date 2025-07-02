import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

export default function Project(
    {
        name,
        folder
    } : {
        name: string
        folder?: string
    }
) {
    const pathname = usePathname()
    const path = "/" + folder ? folder + name : name
    const isActive = pathname === path

    return (
        <Link href={path} className="w-full">
            <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start px-4"
            >
                {name}
            </Button>
        </Link>
    )
}