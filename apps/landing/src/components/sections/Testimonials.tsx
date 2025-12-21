import { Quote } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
    {
        quote: "Благодаря OpenNotify мы сократили расходы на уведомления на 65%. Smart routing автоматически выбирает Telegram для активных пользователей.",
        author: "Азиз Каримов",
        role: "CTO",
        company: "TechStartup.uz",
    },
    {
        quote: "Один API вместо пяти разных интеграций. Подключили все каналы за день вместо недели. Документация отличная!",
        author: "Мадина Рахимова",
        role: "Lead Developer",
        company: "E-commerce Platform",
    },
    {
        quote: "Failover между провайдерами работает безупречно. За 6 месяцев ни одного пропущенного OTP. Uptime 99.99%.",
        author: "Руслан Ибрагимов",
        role: "DevOps Engineer",
        company: "FinTech Company",
    },
]

export function Testimonials(): React.ReactElement {
    return (
        <section className="py-20 bg-muted/30">
            <Container>
                <SectionHeading
                    title="Отзывы клиентов"
                    subtitle="Что говорят разработчики и компании об OpenNotify"
                />

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            className="relative overflow-hidden group hover:shadow-lg transition-shadow"
                        >
                            <CardContent className="p-6">
                                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                                <blockquote className="text-muted-foreground mb-6">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </blockquote>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-primary">
                                            {testimonial.author
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{testimonial.author}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {testimonial.role}, {testimonial.company}
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative gradient */}
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    )
}
