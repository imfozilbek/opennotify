import { DocsLayout } from "fumadocs-ui/layouts/docs"
import type { ReactNode } from "react"
import { source } from "@/lib/source"

export default function Layout({ children }: { children: ReactNode }): React.JSX.Element {
    return (
        <DocsLayout
            tree={source.pageTree}
            nav={{
                title: (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-blue-500" />
                        <span className="font-semibold">OpenNotify</span>
                    </div>
                ),
            }}
            sidebar={{
                defaultOpenLevel: 1,
            }}
        >
            {children}
        </DocsLayout>
    )
}
