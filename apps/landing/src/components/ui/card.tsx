import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    ref?: React.Ref<HTMLDivElement>
}

function Card({ className, ref, ...props }: CardProps): React.JSX.Element {
    return (
        <div
            ref={ref}
            className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
            {...props}
        />
    )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    ref?: React.Ref<HTMLDivElement>
}

function CardHeader({ className, ref, ...props }: CardHeaderProps): React.JSX.Element {
    return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    ref?: React.Ref<HTMLHeadingElement>
}

function CardTitle({ className, ref, ...props }: CardTitleProps): React.JSX.Element {
    return (
        <h3
            ref={ref}
            className={cn("font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    ref?: React.Ref<HTMLParagraphElement>
}

function CardDescription({ className, ref, ...props }: CardDescriptionProps): React.JSX.Element {
    return <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    ref?: React.Ref<HTMLDivElement>
}

function CardContent({ className, ref, ...props }: CardContentProps): React.JSX.Element {
    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    ref?: React.Ref<HTMLDivElement>
}

function CardFooter({ className, ref, ...props }: CardFooterProps): React.JSX.Element {
    return <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
