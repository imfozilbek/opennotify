"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function Tabs(props: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>): React.JSX.Element {
    return <TabsPrimitive.Root {...props} />
}

function TabsList({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>): React.JSX.Element {
    return (
        <TabsPrimitive.List
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
                className,
            )}
            {...props}
        />
    )
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>): React.JSX.Element {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
                className,
            )}
            {...props}
        />
    )
}

function TabsContent({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>): React.JSX.Element {
    return (
        <TabsPrimitive.Content
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className,
            )}
            {...props}
        />
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
