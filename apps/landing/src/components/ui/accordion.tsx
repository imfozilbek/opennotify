"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionSingleProps {
    type: "single"
    collapsible?: boolean
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    className?: string
    children?: React.ReactNode
}

interface AccordionMultipleProps {
    type: "multiple"
    defaultValue?: string[]
    value?: string[]
    onValueChange?: (value: string[]) => void
    className?: string
    children?: React.ReactNode
}

function Accordion(props: AccordionSingleProps | AccordionMultipleProps): React.JSX.Element {
    return <AccordionPrimitive.Root {...props} />
}

function AccordionItem({
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>): React.JSX.Element {
    return <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />
}

function AccordionTrigger({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>): React.JSX.Element {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                className={cn(
                    "flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className,
                )}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    )
}

function AccordionContent({
    className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>): React.JSX.Element {
    return (
        <AccordionPrimitive.Content
            className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            {...props}
        >
            <div className={cn("pb-4 pt-0", className)}>{children}</div>
        </AccordionPrimitive.Content>
    )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
