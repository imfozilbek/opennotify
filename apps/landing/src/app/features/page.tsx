"use client"

import Link from "next/link"
import {
    ArrowRight,
    BarChart3,
    Check,
    FileText,
    Layers,
    Route,
    Shield,
    Webhook,
    Zap,
} from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FEATURES_DETAILED } from "@/lib/constants"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Route,
    Layers,
    BarChart3,
    FileText,
    Webhook,
    Shield,
}

interface FeatureDetailProps {
    feature: (typeof FEATURES_DETAILED)[number]
    index: number
}

function FeatureDetail({ feature, index }: FeatureDetailProps): React.ReactElement {
    const isReversed = index % 2 === 1

    return (
        <section
            id={feature.id}
            className={cn("py-20 scroll-mt-20", index % 2 === 1 && "bg-muted/30")}
        >
            <Container>
                <div
                    className={cn(
                        "grid lg:grid-cols-2 gap-12 items-center",
                        isReversed && "lg:grid-flow-dense",
                    )}
                >
                    <div className={cn(isReversed && "lg:col-start-2")}>
                        <Badge className="mb-4">{feature.tagline}</Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                            {feature.title}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">{feature.description}</p>

                        <div className="space-y-4">
                            {feature.benefits.map((benefit, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Check className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">{benefit.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(isReversed && "lg:col-start-1")}>
                        <FeatureVisual feature={feature} />
                    </div>
                </div>
            </Container>
        </section>
    )
}

function FeatureVisual({
    feature,
}: {
    feature: (typeof FEATURES_DETAILED)[number]
}): React.ReactElement {
    const Icon = iconMap[feature.icon]

    if ("howItWorks" in feature && feature.howItWorks) {
        return (
            <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5">
                <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Как это работает
                    </h4>
                    <div className="space-y-3">
                        {feature.howItWorks.map((step, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                            >
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    {i + 1}
                                </span>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if ("codeExample" in feature && feature.codeExample) {
        return (
            <Card className="bg-slate-950 text-slate-50 overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-2 text-xs text-slate-400">index.ts</span>
                    </div>
                    <pre className="p-4 text-sm font-mono overflow-x-auto">
                        <code>{feature.codeExample}</code>
                    </pre>
                </CardContent>
            </Card>
        )
    }

    if ("metrics" in feature && feature.metrics) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {feature.metrics.map((metric, i) => (
                    <Card key={i} className="text-center">
                        <CardContent className="p-6">
                            <div className="text-3xl font-bold text-primary mb-2">
                                {metric.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{metric.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if ("templateExample" in feature && feature.templateExample) {
        return (
            <Card className="bg-slate-950 text-slate-50 overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-2 text-xs text-slate-400">template.json</span>
                    </div>
                    <pre className="p-4 text-sm font-mono overflow-x-auto">
                        <code>{feature.templateExample}</code>
                    </pre>
                </CardContent>
            </Card>
        )
    }

    if ("events" in feature && feature.events) {
        return (
            <Card>
                <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Поддерживаемые события</h4>
                    <div className="flex flex-wrap gap-2">
                        {feature.events.map((event, i) => (
                            <Badge key={i} variant="secondary" className="font-mono text-xs">
                                {event}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if ("certifications" in feature && feature.certifications) {
        return (
            <Card>
                <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Сертификации и стандарты</h4>
                    <div className="space-y-3">
                        {feature.certifications.map((cert, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="text-sm">{cert}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-2xl flex items-center justify-center">
            <Icon className="h-24 w-24 text-primary/50" />
        </div>
    )
}

function FeatureNav(): React.ReactElement {
    return (
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b py-4 hidden lg:block">
            <Container>
                <nav className="flex justify-center gap-6">
                    {FEATURES_DETAILED.map((feature) => (
                        <a
                            key={feature.id}
                            href={`#${feature.id}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {feature.title}
                        </a>
                    ))}
                </nav>
            </Container>
        </div>
    )
}

function CTASection(): React.ReactElement {
    return (
        <section className="py-20 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10">
            <Container>
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Готовы попробовать?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Начните бесплатно с 500 уведомлений в месяц. Без кредитной карты.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg">
                            Начать бесплатно
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/pricing">Посмотреть цены</Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default function FeaturesPage(): React.ReactElement {
    return (
        <>
            <Header />
            <main className="pt-24">
                <Container>
                    <div className="text-center mb-12">
                        <Badge className="mb-4">Возможности</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                            Всё для эффективных уведомлений
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Smart routing, multi-channel API, аналитика, шаблоны и безопасность —
                            всё что нужно для профессиональной работы с уведомлениями.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {FEATURES_DETAILED.map((feature) => {
                            const Icon = iconMap[feature.icon]
                            return (
                                <a key={feature.id} href={`#${feature.id}`} className="group">
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {feature.tagline}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </a>
                            )
                        })}
                    </div>
                </Container>

                <FeatureNav />

                {FEATURES_DETAILED.map((feature, index) => (
                    <FeatureDetail key={feature.id} feature={feature} index={index} />
                ))}

                <CTASection />
            </main>
            <Footer />
        </>
    )
}
