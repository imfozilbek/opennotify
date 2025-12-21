"use client"

import Link from "next/link"
import {
    ArrowRight,
    Bell,
    GraduationCap,
    Heart,
    Mail,
    MessageCircle,
    MessageSquare,
    Send,
    ShieldCheck,
    ShoppingCart,
    Truck,
    Wallet,
} from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { USE_CASES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    ShieldCheck,
    ShoppingCart,
    Wallet,
    Truck,
    Heart,
    GraduationCap,
}

const channelIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    SMS: MessageSquare,
    Telegram: Send,
    Email: Mail,
    Push: Bell,
    WhatsApp: MessageCircle,
}

function UseCaseCard({
    useCase,
    index,
}: {
    useCase: (typeof USE_CASES)[number]
    index: number
}): React.ReactElement {
    const Icon = iconMap[useCase.icon]
    const isReversed = index % 2 === 1

    return (
        <section
            id={useCase.id}
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
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <Badge variant="outline">{useCase.id.toUpperCase()}</Badge>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                            {useCase.title}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">{useCase.description}</p>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-3">Рекомендуемые каналы</h4>
                            <div className="flex flex-wrap gap-2">
                                {useCase.channels.map((channel) => {
                                    const ChannelIcon = channelIconMap[channel]
                                    return (
                                        <Badge
                                            key={channel}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            <ChannelIcon className="h-3 w-3" />
                                            {channel}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-semibold mb-3">Примеры использования</h4>
                            <ul className="space-y-2">
                                {useCase.examples.map((example, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2 text-muted-foreground"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {example}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Button asChild>
                            <Link href="/pricing">
                                Начать использовать
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className={cn(isReversed && "lg:col-start-1")}>
                        <UseCaseStats useCase={useCase} />
                    </div>
                </div>
            </Container>
        </section>
    )
}

function UseCaseStats({ useCase }: { useCase: (typeof USE_CASES)[number] }): React.ReactElement {
    const stats = useCase.stats as Record<string, string>
    const statLabels: Record<string, string> = {
        deliveryRate: "Доставляемость",
        avgTime: "Время доставки",
        conversionIncrease: "Рост конверсии",
        cartRecovery: "Возврат корзин",
        securityAlerts: "Алерты безопасности",
        compliance: "Соответствие",
        missedDeliveries: "Пропущенные доставки",
        customerSatisfaction: "Удовлетворенность",
        noShowReduction: "Снижение неявок",
        patientEngagement: "Вовлеченность пациентов",
        parentEngagement: "Вовлеченность родителей",
        paymentReminders: "Напоминания об оплате",
    }

    return (
        <Card className="bg-gradient-to-br from-primary/5 to-violet-500/5">
            <CardContent className="p-8">
                <h4 className="font-semibold mb-6 text-lg">Результаты с OpenNotify</h4>
                <div className="grid grid-cols-2 gap-6">
                    {Object.entries(stats).map(([key, value]) => (
                        <div key={key}>
                            <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                            <div className="text-sm text-muted-foreground">
                                {statLabels[key] || key}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function UseCaseNav(): React.ReactElement {
    return (
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-lg border-b py-4 hidden lg:block">
            <Container>
                <nav className="flex justify-center gap-6 flex-wrap">
                    {USE_CASES.map((useCase) => {
                        const Icon = iconMap[useCase.icon]
                        return (
                            <a
                                key={useCase.id}
                                href={`#${useCase.id}`}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <Icon className="h-4 w-4" />
                                {useCase.title}
                            </a>
                        )
                    })}
                </nav>
            </Container>
        </div>
    )
}

function UseCaseGrid(): React.ReactElement {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {USE_CASES.map((useCase) => {
                const Icon = iconMap[useCase.icon]
                return (
                    <a key={useCase.id} href={`#${useCase.id}`} className="group">
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {useCase.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-4">
                                    {useCase.channels.slice(0, 3).map((channel) => {
                                        const ChannelIcon = channelIconMap[channel]
                                        return (
                                            <Badge
                                                key={channel}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                <ChannelIcon className="h-3 w-3 mr-1" />
                                                {channel}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                )
            })}
        </div>
    )
}

function CTASection(): React.ReactElement {
    return (
        <section className="py-20 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10">
            <Container>
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Ваш кейс не в списке?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        OpenNotify подходит для любых сценариев уведомлений. Расскажите нам о вашем
                        проекте, и мы поможем с интеграцией.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg">
                            Связаться с нами
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/pricing">Начать бесплатно</Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default function UseCasesPage(): React.ReactElement {
    return (
        <>
            <Header />
            <main className="pt-24">
                <Container>
                    <div className="text-center mb-12">
                        <Badge className="mb-4">Кейсы использования</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                            Как бизнес использует OpenNotify
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            От OTP-кодов до маркетинговых рассылок — узнайте, как компании из разных
                            отраслей оптимизируют свои уведомления.
                        </p>
                    </div>

                    <UseCaseGrid />
                </Container>

                <UseCaseNav />

                {USE_CASES.map((useCase, index) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} index={index} />
                ))}

                <CTASection />
            </main>
            <Footer />
        </>
    )
}
