import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
        ),
        p: ({ children }) => (
            <p className="my-4 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
            <ul className="list-disc list-inside my-4 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal list-inside my-4 space-y-2">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
        ),
        code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
            </code>
        ),
        pre: ({ children }) => (
            <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto my-4">
                {children}
            </pre>
        ),
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                {children}
            </blockquote>
        ),
        a: ({ href, children }) => (
            <a
                href={href}
                className="text-primary hover:underline"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
                {children}
            </a>
        ),
        hr: () => <hr className="my-8 border-border" />,
        strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ...components,
    }
}
