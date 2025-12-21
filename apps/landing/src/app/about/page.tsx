"use client"

import Link from "next/link"
import { ArrowRight, Code, Globe, Heart, MapPin, Target, Users, Zap } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function HeroSection(): React.ReactElement {
    return (
        <section className="py-20">
            <Container>
                <div className="max-w-3xl mx-auto text-center">
                    <Badge className="mb-4">О компании</Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                        Мы делаем уведомления простыми для Центральной Азии
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        OpenNotify — это unified notification API, созданный специально для
                        разработчиков и бизнесов Узбекистана и региона. Мы объединяем SMS, Telegram,
                        Email, Push и WhatsApp в одном простом API.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Ташкент, Узбекистан
                        </div>
                        <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            Центральная Азия
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

function MissionSection(): React.ReactElement {
    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <Badge className="mb-4">Миссия</Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                            Упростить отправку уведомлений для каждого разработчика
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            Мы верим, что разработчики не должны тратить недели на интеграцию
                            разрозненных API провайдеров. С OpenNotify подключение всех каналов
                            уведомлений занимает минуты, а не дни.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Code className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Developer-first</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Простой API, отличная документация, SDK для всех популярных
                                        языков
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Локальный фокус</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Глубокая интеграция с провайдерами Узбекистана: Eskiz,
                                        PlayMobile, GetSMS
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Zap className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Умная оптимизация</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Smart Routing экономит до 70% на уведомлениях без потери
                                        доставляемости
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                                <div className="text-sm text-muted-foreground">Компаний</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl font-bold mb-2">1M+</div>
                                <div className="text-sm text-muted-foreground">Уведомлений/мес</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl font-bold mb-2">5</div>
                                <div className="text-sm text-muted-foreground">Каналов</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                                <div className="text-sm text-muted-foreground">Uptime</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </section>
    )
}

function ValuesSection(): React.ReactElement {
    const values = [
        {
            icon: Target,
            title: "Простота",
            description:
                "Минимум кода для максимального результата. Один API вместо пяти интеграций.",
        },
        {
            icon: Zap,
            title: "Скорость",
            description: "Быстрая доставка сообщений, быстрая интеграция, быстрая поддержка.",
        },
        {
            icon: Heart,
            title: "Надежность",
            description: "99.9% uptime, автоматический failover, мониторинг 24/7.",
        },
        {
            icon: Users,
            title: "Прозрачность",
            description: "Честные цены без скрытых платежей. Открытая документация и changelog.",
        },
    ]

    return (
        <section className="py-20">
            <Container>
                <div className="text-center mb-12">
                    <Badge className="mb-4">Ценности</Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Что для нас важно
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => {
                        const Icon = value.icon
                        return (
                            <Card key={index}>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {value.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}

function TimelineSection(): React.ReactElement {
    const milestones = [
        {
            date: "Q4 2024",
            title: "Идея и исследование",
            description:
                "Анализ рынка уведомлений в Узбекистане, исследование проблем разработчиков",
        },
        {
            date: "Q1 2025",
            title: "MVP и первые пользователи",
            description: "Запуск MVP с поддержкой SMS и Telegram, первые интеграции",
        },
        {
            date: "Q2 2025",
            title: "Расширение каналов",
            description: "Добавление Email, Push, WhatsApp. Запуск Smart Routing",
        },
        {
            date: "Q3 2025",
            title: "SDK и документация",
            description: "Официальные SDK для Node.js, Python, PHP, Go. Developer Portal",
        },
        {
            date: "Q4 2025",
            title: "Enterprise и масштабирование",
            description: "Enterprise план, SOC 2 сертификация, расширение на регион",
        },
    ]

    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <div className="text-center mb-12">
                    <Badge className="mb-4">Путь</Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Наш путь развития
                    </h2>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="space-y-8">
                        {milestones.map((milestone, index) => (
                            <div key={index} className="flex gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-primary" />
                                    {index < milestones.length - 1 && (
                                        <div className="w-0.5 h-full bg-border mt-2" />
                                    )}
                                </div>
                                <div className="pb-8">
                                    <Badge variant="outline" className="mb-2">
                                        {milestone.date}
                                    </Badge>
                                    <h3 className="font-semibold text-lg mb-1">
                                        {milestone.title}
                                    </h3>
                                    <p className="text-muted-foreground">{milestone.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}

function OpenSourceSection(): React.ReactElement {
    return (
        <section className="py-20">
            <Container>
                <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 rounded-2xl p-8 md:p-12">
                    <div className="max-w-3xl mx-auto text-center">
                        <Badge className="mb-4">Open Source</Badge>
                        <h2 className="text-3xl font-bold mb-4">Открытость в ДНК</h2>
                        <p className="text-muted-foreground mb-8">
                            SDK OpenNotify полностью открыты и доступны на GitHub. Мы верим в
                            прозрачность и community-driven разработку. Внесите свой вклад или
                            просто изучите код.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link
                                    href="https://github.com/opennotify"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Смотреть на GitHub
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/pricing">Начать бесплатно</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}

function ContactSection(): React.ReactElement {
    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <div className="text-center max-w-2xl mx-auto">
                    <Badge className="mb-4">Контакты</Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Давайте поговорим
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Есть вопросы? Хотите обсудить интеграцию или партнерство? Мы всегда рады
                        пообщаться.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6 text-center">
                                <h4 className="font-semibold mb-2">Email</h4>
                                <a
                                    href="mailto:hello@opennotify.dev"
                                    className="text-primary hover:underline"
                                >
                                    hello@opennotify.dev
                                </a>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <h4 className="font-semibold mb-2">Telegram</h4>
                                <a
                                    href="https://t.me/opennotify"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    @opennotify
                                </a>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 text-center">
                                <h4 className="font-semibold mb-2">GitHub</h4>
                                <a
                                    href="https://github.com/opennotify"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    github.com/opennotify
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                    <Button size="lg">
                        Связаться с нами
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Container>
        </section>
    )
}

export default function AboutPage(): React.ReactElement {
    return (
        <>
            <Header />
            <main className="pt-24">
                <HeroSection />
                <MissionSection />
                <ValuesSection />
                <TimelineSection />
                <OpenSourceSection />
                <ContactSection />
            </main>
            <Footer />
        </>
    )
}
