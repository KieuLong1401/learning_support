import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";
import React, { ReactNode } from "react";

export default function Context(
    {
        children,
        context_menu_item
    }:{
        children: ReactNode,
        context_menu_item: {
            name: string
            callback: () => void
        }[]
    }
) {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
                {context_menu_item.map(item => {
                    return <ContextMenuItem key={item.name} onClick={item.callback}>{item.name}</ContextMenuItem>
                })}
            </ContextMenuContent>
        </ContextMenu>
    )
}