import { cn } from "@/lib/utils"

interface SectionHeadingProps {
    title: string
    subtitle?: string
    className?: string
    align?: "left" | "center"
}

export function SectionHeading({
    title,
    subtitle,
    className,
    align = "center",
}: SectionHeadingProps): React.ReactElement {
    return (
        <div className={cn("mb-12", align === "center" && "text-center", className)}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            {subtitle && (
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
            )}
        </div>
    )
}
