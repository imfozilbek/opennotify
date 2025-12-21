import { Check } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PRICING_TIERS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Pricing(): React.ReactElement {
    return (
        <section id="pricing" className="py-20">
            <Container>
                <SectionHeading
                    title="Простые и прозрачные цены"
                    subtitle="Начните бесплатно, масштабируйтесь по мере роста"
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {PRICING_TIERS.map((tier) => (
                        <Card
                            key={tier.name}
                            className={cn(
                                "relative flex flex-col",
                                tier.popular &&
                                    "border-primary shadow-lg shadow-primary/10 scale-105",
                            )}
                        >
                            {tier.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    Популярный
                                </Badge>
                            )}

                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-lg">{tier.name}</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">${tier.price}</span>
                                    <span className="text-muted-foreground">/{tier.period}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {tier.messages} уведомлений
                                </p>
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
                                    variant={tier.popular ? "default" : "outline"}
                                >
                                    {tier.cta}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Нужно больше?{" "}
                    <a href="#" className="text-primary hover:underline">
                        Свяжитесь с нами
                    </a>{" "}
                    для индивидуального предложения.
                </p>
            </Container>
        </section>
    )
}
