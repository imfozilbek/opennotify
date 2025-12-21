"use client"

import { useMemo } from "react"

interface MDXContentProps {
    content: string
}

export function MDXContent({ content }: MDXContentProps): React.ReactElement {
    const processedContent = useMemo(() => {
        const lines = content.split("\n")
        const elements: React.ReactNode[] = []
        let inCodeBlock = false
        let codeContent: string[] = []
        let codeLanguage = ""

        lines.forEach((line, index) => {
            if (line.startsWith("```")) {
                if (!inCodeBlock) {
                    inCodeBlock = true
                    codeLanguage = line.slice(3).trim()
                    codeContent = []
                } else {
                    inCodeBlock = false
                    elements.push(
                        <pre
                            key={`code-${String(index)}`}
                            className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto my-4"
                        >
                            <code className={`language-${codeLanguage}`}>
                                {codeContent.join("\n")}
                            </code>
                        </pre>,
                    )
                }
                return
            }

            if (inCodeBlock) {
                codeContent.push(line)
                return
            }

            if (line.startsWith("# ")) {
                elements.push(
                    <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                        {line.slice(2)}
                    </h1>,
                )
            } else if (line.startsWith("## ")) {
                elements.push(
                    <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                        {line.slice(3)}
                    </h2>,
                )
            } else if (line.startsWith("### ")) {
                elements.push(
                    <h3 key={index} className="text-xl font-semibold mt-4 mb-2">
                        {line.slice(4)}
                    </h3>,
                )
            } else if (line.startsWith("- ")) {
                elements.push(
                    <li key={index} className="ml-4 my-1">
                        {processInlineMarkdown(line.slice(2))}
                    </li>,
                )
            } else if (line.startsWith("> ")) {
                elements.push(
                    <blockquote
                        key={index}
                        className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground"
                    >
                        {processInlineMarkdown(line.slice(2))}
                    </blockquote>,
                )
            } else if (line.trim() === "") {
                elements.push(<div key={index} className="h-4" />)
            } else {
                elements.push(
                    <p key={index} className="my-2 leading-relaxed">
                        {processInlineMarkdown(line)}
                    </p>,
                )
            }
        })

        return elements
    }, [content])

    return <div className="mdx-content">{processedContent}</div>
}

interface MatchInfo {
    type: string
    match: RegExpExecArray
    index: number
}

function processInlineMarkdown(text: string): React.ReactNode {
    const parts: React.ReactNode[] = []
    let remaining = text
    let keyIndex = 0

    const boldRegex = /\*\*(.+?)\*\*/
    const italicRegex = /\*(.+?)\*/
    const codeRegex = /`(.+?)`/
    const linkRegex = /\[(.+?)\]\((.+?)\)/

    while (remaining.length > 0) {
        const boldMatch = boldRegex.exec(remaining)
        const italicMatch = italicRegex.exec(remaining)
        const codeMatch = codeRegex.exec(remaining)
        const linkMatch = linkRegex.exec(remaining)

        const matches: MatchInfo[] = []
        if (boldMatch && boldMatch.index !== undefined) {
            matches.push({ type: "bold", match: boldMatch, index: boldMatch.index })
        }
        if (italicMatch && italicMatch.index !== undefined) {
            matches.push({ type: "italic", match: italicMatch, index: italicMatch.index })
        }
        if (codeMatch && codeMatch.index !== undefined) {
            matches.push({ type: "code", match: codeMatch, index: codeMatch.index })
        }
        if (linkMatch && linkMatch.index !== undefined) {
            matches.push({ type: "link", match: linkMatch, index: linkMatch.index })
        }

        matches.sort((a, b) => a.index - b.index)

        if (matches.length === 0) {
            parts.push(remaining)
            break
        }

        const firstMatch = matches[0]

        if (firstMatch.index > 0) {
            parts.push(remaining.slice(0, firstMatch.index))
        }

        if (firstMatch.type === "bold") {
            parts.push(
                <strong key={keyIndex++} className="font-semibold">
                    {firstMatch.match[1]}
                </strong>,
            )
            remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length)
        } else if (firstMatch.type === "italic") {
            parts.push(
                <em key={keyIndex++} className="italic">
                    {firstMatch.match[1]}
                </em>,
            )
            remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length)
        } else if (firstMatch.type === "code") {
            parts.push(
                <code key={keyIndex++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {firstMatch.match[1]}
                </code>,
            )
            remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length)
        } else if (firstMatch.type === "link") {
            parts.push(
                <a
                    key={keyIndex++}
                    href={firstMatch.match[2]}
                    className="text-primary hover:underline"
                    target={firstMatch.match[2].startsWith("http") ? "_blank" : undefined}
                    rel={firstMatch.match[2].startsWith("http") ? "noopener noreferrer" : undefined}
                >
                    {firstMatch.match[1]}
                </a>,
            )
            remaining = remaining.slice(firstMatch.index + firstMatch.match[0].length)
        }
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>
}
