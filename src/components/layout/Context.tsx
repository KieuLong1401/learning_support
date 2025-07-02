import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@radix-ui/react-context-menu";
import React, { ReactNode } from "react";

export default function Context(
    {
        children,
        context_menu_item
    }:{
        children: ReactNode,
        context_menu_item: string[]
    }
) {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                {context_menu_item.map(item => {
                    return <ContextMenuItem key={item}>{item}</ContextMenuItem>
                })}
            </ContextMenuContent>
        </ContextMenu>
    )
}