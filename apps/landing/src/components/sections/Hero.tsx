"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/shared/Container"

const codeSnippet = `import { OpenNotify } from "@opennotify/node-sdk"

const client = new OpenNotify({ apiKey: "sk_live_..." })

await client.send({
    to: "+998901234567",
    message: "Ваш код: 123456"
})`

export function Hero(): React.ReactElement {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left side - Text */}
                    <div className="flex-1 text-center lg:text-left">
                        <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
                            <span className="mr-2">🇺🇿</span>
                            Создано для Центральной Азии
                        </Badge>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            Единый API для всех каналов{" "}
                            <span className="text-primary">уведомлений</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
                            SMS, Telegram, Email, Push, WhatsApp — один API, умная маршрутизация,{" "}
                            <span className="text-foreground font-medium">70% экономии</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="gap-2">
                                Начать бесплатно
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline">
                                Документация
                            </Button>
                        </div>

                        <p className="mt-6 text-sm text-muted-foreground">
                            Бесплатно до 500 уведомлений в месяц. Без карты.
                        </p>
                    </div>

                    {/* Right side - Code */}
                    <div className="flex-1 w-full max-w-xl">
                        <div className="relative">
                            {/* Code window */}
                            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
                                {/* Window header */}
                                <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        send-notification.ts
                                    </span>
                                </div>
                                {/* Code content */}
                                <pre className="p-4 overflow-x-auto">
                                    <code className="text-sm font-mono text-foreground">
                                        {codeSnippet}
                                    </code>
                                </pre>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-20" />
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-accent to-primary rounded-full blur-2xl opacity-20" />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
