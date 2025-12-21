"use client"

import { useState } from "react"
import { ArrowRight, Check, Sparkles, X } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { PRICING_FAQ, PRICING_FEATURES_MATRIX, PRICING_TIERS_FULL } from "@/lib/constants"
import { cn } from "@/lib/utils"

type BillingPeriod = "monthly" | "annual"

function BillingToggle({
    period,
    onChange,
}: {
    period: BillingPeriod
    onChange: (period: BillingPeriod) => void
}): React.ReactElement {
    return (
        <div className="flex items-center justify-center gap-4 mb-12">
            <span
                className={cn(
                    "text-sm font-medium transition-colors",
                    period === "monthly" ? "text-foreground" : "text-muted-foreground",
                )}
            >
                Ежемесячно
            </span>
            <button
                onClick={() => {
                    onChange(period === "monthly" ? "annual" : "monthly")
                }}
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    period === "annual" ? "bg-primary" : "bg-muted",
                )}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        period === "annual" ? "translate-x-6" : "translate-x-1",
                    )}
                />
            </button>
            <span
                className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-2",
                    period === "annual" ? "text-foreground" : "text-muted-foreground",
                )}
            >
                Годовая
                <Badge variant="secondary" className="text-xs">
                    -17%
                </Badge>
            </span>
        </div>
    )
}

function PricingCards({ period }: { period: BillingPeriod }): React.ReactElement {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {PRICING_TIERS_FULL.map((tier) => {
                const price = period === "monthly" ? tier.monthlyPrice : tier.annualPrice
                const isEnterprise = tier.monthlyPrice === -1

                return (
                    <Card
                        key={tier.name}
                        className={cn(
                            "relative flex flex-col",
                            tier.popular &&
                                "border-primary shadow-lg shadow-primary/10 scale-105 z-10",
                            isEnterprise && "bg-gradient-to-br from-violet-500/10 to-primary/10",
                        )}
                    >
                        {tier.popular && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                Популярный
                            </Badge>
                        )}

                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-lg flex items-center justify-center gap-2">
                                {tier.name}
                                {isEnterprise && <Sparkles className="h-4 w-4 text-violet-500" />}
                            </CardTitle>
                            <div className="mt-4">
                                {isEnterprise ? (
                                    <span className="text-2xl font-bold">Индивидуально</span>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold">${price}</span>
                                        <span className="text-muted-foreground">
                                            /{period === "monthly" ? "мес" : "мес"}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                {tier.messages} уведомлений
                                {!isEnterprise && period === "annual" && "/мес"}
                            </p>
                            {period === "annual" && !isEnterprise && price > 0 && (
                                <p className="text-xs text-primary mt-1">
                                    ${String(price * 12)}/год (экономия $
                                    {String((tier.monthlyPrice - price) * 12)})
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col">
                            <ul className="space-y-3 flex-1">
                                {tier.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-muted-foreground">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full mt-6"
                                variant={
                                    tier.popular ? "default" : isEnterprise ? "outline" : "outline"
                                }
                            >
                                {tier.cta}
                                {isEnterprise && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

function FeatureValue({ value }: { value: boolean | string }): React.ReactElement {
    if (typeof value === "boolean") {
        return value ? (
            <Check className="h-5 w-5 text-primary mx-auto" />
        ) : (
            <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
        )
    }
    return <span className="text-sm text-center block">{value}</span>
}

function ComparisonTable(): React.ReactElement {
    const plans = ["free", "starter", "growth", "business", "enterprise"] as const

    return (
        <div className="mt-24">
            <h2 className="text-2xl font-bold text-center mb-8">Сравнение тарифов</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-4 px-4 font-medium">Возможности</th>
                            <th className="text-center py-4 px-4 font-medium w-24">FREE</th>
                            <th className="text-center py-4 px-4 font-medium w-24 bg-primary/5">
                                STARTER
                            </th>
                            <th className="text-center py-4 px-4 font-medium w-24">GROWTH</th>
                            <th className="text-center py-4 px-4 font-medium w-24">BUSINESS</th>
                            <th className="text-center py-4 px-4 font-medium w-24">ENTERPRISE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PRICING_FEATURES_MATRIX.map((category) => (
                            <>
                                <tr key={category.category} className="bg-muted/50">
                                    <td colSpan={6} className="py-3 px-4 font-semibold text-sm">
                                        {category.category}
                                    </td>
                                </tr>
                                {category.features.map((feature) => (
                                    <tr key={feature.name} className="border-b border-border/50">
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                            {feature.name}
                                        </td>
                                        {plans.map((plan) => (
                                            <td
                                                key={plan}
                                                className={cn(
                                                    "py-3 px-4",
                                                    plan === "starter" && "bg-primary/5",
                                                )}
                                            >
                                                <FeatureValue
                                                    value={feature[plan] as boolean | string}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function PricingFAQ(): React.ReactElement {
    return (
        <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Часто задаваемые вопросы</h2>
            <Accordion type="single" collapsible className="w-full">
                {PRICING_FAQ.map((item, index) => (
                    <AccordionItem key={index} value={`item-${String(index)}`}>
                        <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

function EnterpriseCTA(): React.ReactElement {
    return (
        <div className="mt-24 bg-gradient-to-r from-violet-500/10 via-primary/10 to-violet-500/10 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
                <Badge className="mb-4">Enterprise</Badge>
                <h2 className="text-3xl font-bold mb-4">Нужно индивидуальное решение?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Для крупных компаний мы предлагаем выделенную инфраструктуру, кастомный SLA,
                    on-premise развертывание и персональную поддержку 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg">
                        Связаться с отделом продаж
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline">
                        Запросить демо
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function PricingPage(): React.ReactElement {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")

    return (
        <>
            <Header />
            <main className="pt-24 pb-16">
                <Container>
                    <div className="text-center mb-12">
                        <Badge className="mb-4">Цены</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                            Простые и прозрачные цены
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Начните бесплатно, масштабируйтесь по мере роста. Никаких скрытых
                            платежей.
                        </p>
                    </div>

                    <BillingToggle period={billingPeriod} onChange={setBillingPeriod} />
                    <PricingCards period={billingPeriod} />
                    <ComparisonTable />
                    <EnterpriseCTA />
                    <PricingFAQ />
                </Container>
            </main>
            <Footer />
        </>
    )
}
