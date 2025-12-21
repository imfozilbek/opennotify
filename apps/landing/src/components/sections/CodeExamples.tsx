"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CODE_EXAMPLES } from "@/lib/constants"

const languages = [
    { id: "nodejs", label: "Node.js" },
    { id: "python", label: "Python" },
    { id: "php", label: "PHP" },
    { id: "go", label: "Go" },
    { id: "curl", label: "cURL" },
] as const

export function CodeExamples(): React.ReactElement {
    const [copied, setCopied] = useState<string | null>(null)

    function handleCopy(code: string, lang: string): void {
        navigator.clipboard.writeText(code).catch(() => {
            // Ignore clipboard errors
        })
        setCopied(lang)
        setTimeout(() => {
            setCopied(null)
        }, 2000)
    }

    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <SectionHeading
                    title="Простая интеграция"
                    subtitle="Несколько строк кода — и вы готовы отправлять уведомления"
                />

                <div className="max-w-4xl mx-auto">
                    <Tabs defaultValue="nodejs" className="w-full">
                        <TabsList className="w-full justify-start mb-4 bg-background border">
                            {languages.map((lang) => (
                                <TabsTrigger
                                    key={lang.id}
                                    value={lang.id}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    {lang.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {languages.map((lang) => (
                            <TabsContent key={lang.id} value={lang.id}>
                                <div className="relative rounded-xl border bg-card overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                                        <span className="text-sm text-muted-foreground">
                                            {lang.label}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                handleCopy(CODE_EXAMPLES[lang.id], lang.id)
                                            }}
                                            className="h-8 gap-2"
                                        >
                                            {copied === lang.id ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    Скопировано
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" />
                                                    Копировать
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {/* Code */}
                                    <pre className="p-4 overflow-x-auto">
                                        <code className="text-sm font-mono">
                                            {CODE_EXAMPLES[lang.id]}
                                        </code>
                                    </pre>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </Container>
        </section>
    )
}
