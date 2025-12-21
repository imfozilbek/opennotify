"use client"

import Link from "next/link"
import {
    ArrowRight,
    Bell,
    Check,
    Clock,
    DollarSign,
    Globe,
    Mail,
    MessageCircle,
    MessageSquare,
    Send,
    X,
    Zap,
} from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CHANNELS_DETAILED } from "@/lib/constants"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    MessageSquare,
    Send,
    Mail,
    Bell,
    MessageCircle,
}

const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10",
    sky: "text-sky-500 bg-sky-500/10",
    violet: "text-violet-500 bg-violet-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    green: "text-green-500 bg-green-500/10",
}

function ChannelCard({
    channel,
}: {
    channel: (typeof CHANNELS_DETAILED)[number]
}): React.ReactElement {
    const Icon = iconMap[channel.icon]
    const colorClass = colorMap[channel.color]

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div
                        className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center",
                            colorClass,
                        )}
                    >
                        <Icon className="h-7 w-7" />
                    </div>
                    <Badge variant="outline">{channel.pricing}</Badge>
                </div>
                <CardTitle className="text-2xl mt-4">{channel.name}</CardTitle>
                <p className="text-muted-foreground">{channel.tagline}</p>
            </CardHeader>

            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{channel.description}</p>

                <div className="grid grid-cols-3 gap-4 py-4 border-y">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                            {channel.deliveryRate}
                        </div>
                        <div className="text-xs text-muted-foreground">Delivery Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{channel.avgDeliveryTime}</div>
                        <div className="text-xs text-muted-foreground">Скорость</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{channel.providers.length}</div>
                        <div className="text-xs text-muted-foreground">Провайдеров</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-3">Провайдеры</h4>
                    <div className="space-y-2">
                        {channel.providers.map((provider, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
                            >
                                <div>
                                    <span className="font-medium">{provider.name}</span>
                                    <span className="text-muted-foreground ml-2">
                                        — {provider.description}
                                    </span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {provider.region}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-3">Сценарии использования</h4>
                    <div className="flex flex-wrap gap-2">
                        {channel.useCases.map((useCase, i) => (
                            <Badge key={i} variant="outline">
                                {useCase}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" /> Преимущества
                        </h4>
                        <ul className="space-y-1">
                            {channel.pros.map((pro, i) => (
                                <li key={i} className="text-xs text-muted-foreground">
                                    • {pro}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2 text-orange-600 flex items-center gap-1">
                            <X className="h-4 w-4" /> Ограничения
                        </h4>
                        <ul className="space-y-1">
                            {channel.cons.map((con, i) => (
                                <li key={i} className="text-xs text-muted-foreground">
                                    • {con}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ChannelComparison(): React.ReactElement {
    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <h2 className="text-2xl font-bold text-center mb-8">Сравнение каналов</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-4 px-4 font-medium">Характеристика</th>
                                {CHANNELS_DETAILED.map((channel) => {
                                    const Icon = iconMap[channel.icon]
                                    return (
                                        <th key={channel.id} className="text-center py-4 px-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <Icon className="h-5 w-5" />
                                                <span className="font-medium">{channel.name}</span>
                                            </div>
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-3 px-4 text-sm flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    Стоимость
                                </td>
                                {CHANNELS_DETAILED.map((channel) => (
                                    <td key={channel.id} className="py-3 px-4 text-center text-sm">
                                        {channel.pricing}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4 text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                    Delivery Rate
                                </td>
                                {CHANNELS_DETAILED.map((channel) => (
                                    <td key={channel.id} className="py-3 px-4 text-center text-sm">
                                        <span className="text-primary font-medium">
                                            {channel.deliveryRate}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4 text-sm flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    Скорость доставки
                                </td>
                                {CHANNELS_DETAILED.map((channel) => (
                                    <td key={channel.id} className="py-3 px-4 text-center text-sm">
                                        {channel.avgDeliveryTime}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4 text-sm flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    Требует интернет
                                </td>
                                {CHANNELS_DETAILED.map((channel) => (
                                    <td key={channel.id} className="py-3 px-4 text-center">
                                        {channel.id === "sms" ? (
                                            <X className="h-5 w-5 text-green-500 mx-auto" />
                                        ) : (
                                            <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                                        )}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4 text-sm">Rich-контент</td>
                                {CHANNELS_DETAILED.map((channel) => (
                                    <td key={channel.id} className="py-3 px-4 text-center">
                                        {channel.id === "sms" ? (
                                            <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                        ) : (
                                            <Check className="h-5 w-5 text-primary mx-auto" />
                                        )}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm">Охват аудитории</td>
                                <td className="py-3 px-4 text-center text-sm">100%</td>
                                <td className="py-3 px-4 text-center text-sm">~70%</td>
                                <td className="py-3 px-4 text-center text-sm">~90%</td>
                                <td className="py-3 px-4 text-center text-sm">По приложению</td>
                                <td className="py-3 px-4 text-center text-sm">~60%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Container>
        </section>
    )
}

function SmartRoutingPromo(): React.ReactElement {
    return (
        <section className="py-20">
            <Container>
                <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-2xl p-8 md:p-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <Badge className="mb-4">Smart Routing</Badge>
                        <h2 className="text-3xl font-bold mb-4">Не знаете какой канал выбрать?</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                            Используйте Smart Routing — система автоматически выберет оптимальный
                            канал для каждого получателя на основе стоимости, доступности и
                            предпочтений.
                        </p>

                        <div className="grid sm:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl font-bold text-primary mb-1">70%</div>
                                    <div className="text-sm text-muted-foreground">Экономия</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl font-bold mb-1">99.5%</div>
                                    <div className="text-sm text-muted-foreground">
                                        Доставляемость
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-3xl font-bold mb-1">Auto</div>
                                    <div className="text-sm text-muted-foreground">Failover</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Button size="lg" asChild>
                            <Link href="/features#smart-routing">
                                Узнать больше о Smart Routing
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    )
}

function CTASection(): React.ReactElement {
    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Готовы подключить все каналы?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Начните с бесплатного плана и подключите свои провайдеры за минуты.
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

export default function ChannelsPage(): React.ReactElement {
    return (
        <>
            <Header />
            <main className="pt-24">
                <Container>
                    <div className="text-center mb-12">
                        <Badge className="mb-4">Каналы доставки</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                            5 каналов — один API
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            SMS, Telegram, Email, Push, WhatsApp — подключите все каналы через
                            единый интерфейс OpenNotify.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {CHANNELS_DETAILED.map((channel) => (
                            <ChannelCard key={channel.id} channel={channel} />
                        ))}
                    </div>
                </Container>

                <ChannelComparison />
                <SmartRoutingPromo />
                <CTASection />
            </main>
            <Footer />
        </>
    )
}
