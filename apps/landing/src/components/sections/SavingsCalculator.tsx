"use client"

import { useMemo, useState } from "react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

const SMS_PRICE = 100 // UZS per SMS
const TELEGRAM_RATIO = 0.7 // 70% can go via Telegram
const DOLLAR_RATE = 12500 // UZS to USD

function formatNumber(num: number): string {
    return new Intl.NumberFormat("ru-RU").format(num)
}

function formatCurrency(num: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(num)
}

interface StatCardProps {
    label: string
    value: string
    subtext: string
    className?: string
    valueClassName?: string
}

function StatCard({
    label,
    value,
    subtext,
    className,
    valueClassName,
}: StatCardProps): React.ReactElement {
    return (
        <div className={`text-center p-4 rounded-xl ${className ?? ""}`}>
            <p className="text-sm text-muted-foreground mb-2">{label}</p>
            <p className={`text-2xl font-bold ${valueClassName ?? ""}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
    )
}

interface Calculations {
    monthlyVolume: number
    smsOnlyCost: number
    openNotifyCost: number
    monthlySavings: number
    annualSavings: number
    savingsPercent: number
    telegramMessages: number
    smsMessages: number
}

function useCalculations(volume: number[]): Calculations {
    return useMemo(() => {
        const monthlyVolume = volume[0]
        const smsOnlyCost = monthlyVolume * SMS_PRICE
        const telegramMessages = Math.floor(monthlyVolume * TELEGRAM_RATIO)
        const smsMessages = monthlyVolume - telegramMessages
        const openNotifyCost = smsMessages * SMS_PRICE
        const monthlySavings = smsOnlyCost - openNotifyCost
        const annualSavings = monthlySavings * 12
        const savingsPercent = Math.round((monthlySavings / smsOnlyCost) * 100)

        return {
            monthlyVolume,
            smsOnlyCost: smsOnlyCost / DOLLAR_RATE,
            openNotifyCost: openNotifyCost / DOLLAR_RATE,
            monthlySavings: monthlySavings / DOLLAR_RATE,
            annualSavings: annualSavings / DOLLAR_RATE,
            savingsPercent,
            telegramMessages,
            smsMessages,
        }
    }, [volume])
}

export function SavingsCalculator(): React.ReactElement {
    const [volume, setVolume] = useState([10000])
    const calc = useCalculations(volume)

    return (
        <section className="py-20">
            <Container>
                <SectionHeading
                    title="Калькулятор экономии"
                    subtitle="Узнайте, сколько вы можете сэкономить с OpenNotify"
                />
                <div className="max-w-4xl mx-auto">
                    <Card>
                        <CardContent className="p-8">
                            <div className="mb-12">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-muted-foreground">
                                        Уведомлений в месяц
                                    </span>
                                    <span className="text-2xl font-bold">
                                        {formatNumber(calc.monthlyVolume)}
                                    </span>
                                </div>
                                <Slider
                                    value={volume}
                                    onValueChange={setVolume}
                                    min={1000}
                                    max={100000}
                                    step={1000}
                                    className="mb-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1,000</span>
                                    <span>100,000</span>
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-6">
                                <StatCard
                                    label="Только SMS"
                                    value={formatCurrency(calc.smsOnlyCost)}
                                    subtext="в месяц"
                                    className="bg-muted/50"
                                    valueClassName="text-destructive"
                                />
                                <StatCard
                                    label="С OpenNotify"
                                    value={formatCurrency(calc.openNotifyCost)}
                                    subtext="в месяц"
                                    className="bg-primary/10 border-2 border-primary"
                                    valueClassName="text-primary"
                                />
                                <StatCard
                                    label="Экономия"
                                    value={formatCurrency(calc.monthlySavings)}
                                    subtext={`${String(calc.savingsPercent)}% в месяц`}
                                    className="bg-success/10"
                                    valueClassName="text-success"
                                />
                            </div>
                            <div className="mt-8 text-center p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
                                <p className="text-muted-foreground mb-2">Годовая экономия</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    {formatCurrency(calc.annualSavings)}
                                </p>
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-6">
                                {formatNumber(calc.telegramMessages)} сообщений через Telegram
                                (бесплатно) + {formatNumber(calc.smsMessages)} через SMS
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </section>
    )
}
