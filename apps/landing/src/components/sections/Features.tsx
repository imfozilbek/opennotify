import { Layers, PiggyBank, Route } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { Card, CardContent } from "@/components/ui/card"
import { FEATURES } from "@/lib/constants"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Route,
    Layers,
    PiggyBank,
}

export function Features(): React.ReactElement {
    return (
        <section id="features" className="py-20">
            <Container>
                <SectionHeading
                    title="Почему OpenNotify?"
                    subtitle="Три ключевых преимущества платформы"
                />

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {FEATURES.map((feature, index) => {
                        const Icon = iconMap[feature.icon]
                        return (
                            <Card
                                key={index}
                                className="text-center group hover:shadow-xl transition-all duration-300"
                            >
                                <CardContent className="p-8">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}
