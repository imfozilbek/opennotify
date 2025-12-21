import { ArrowRight } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { Button } from "@/components/ui/button"

export function FinalCTA(): React.ReactElement {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
            </div>

            <Container>
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Готовы начать?</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Присоединяйтесь к 50+ компаниям, которые уже экономят на уведомлениях с
                        OpenNotify. Бесплатный план включает 500 сообщений в месяц.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="gap-2">
                            Создать аккаунт бесплатно
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline">
                            Связаться с нами
                        </Button>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        Без карты. Настройка за 5 минут.
                    </p>
                </div>
            </Container>
        </section>
    )
}
