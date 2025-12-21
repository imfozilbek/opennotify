import { Check, X } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"

const problems = [
    "Отдельная интеграция для каждого провайдера",
    "Разные API для SMS, Email, Push",
    "Нет единой аналитики по каналам",
    "Высокие расходы на SMS",
    "Сложный failover между провайдерами",
]

const solutions = [
    "Один API для всех провайдеров",
    "Unified interface для всех каналов",
    "Единый дашборд и аналитика",
    "70% экономии с smart routing",
    "Автоматический failover",
]

export function ProblemSolution(): React.ReactElement {
    return (
        <section className="py-20">
            <Container>
                <SectionHeading
                    title="Проблема → Решение"
                    subtitle="Сравните работу с уведомлениями до и после OpenNotify"
                />

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Problem */}
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                                <X className="h-4 w-4 text-destructive" />
                            </div>
                            <h3 className="font-semibold text-lg">Без OpenNotify</h3>
                        </div>
                        <ul className="space-y-4">
                            {problems.map((problem, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{problem}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solution */}
                    <div className="rounded-2xl border border-success/20 bg-success/5 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                <Check className="h-4 w-4 text-success" />
                            </div>
                            <h3 className="font-semibold text-lg">С OpenNotify</h3>
                        </div>
                        <ul className="space-y-4">
                            {solutions.map((solution, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Container>
        </section>
    )
}
