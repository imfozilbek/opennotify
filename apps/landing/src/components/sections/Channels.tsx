import { Bell, Mail, MessageCircle, MessageSquare, Send } from "lucide-react"
import { Container } from "@/components/shared/Container"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { Card, CardContent } from "@/components/ui/card"
import { CHANNELS } from "@/lib/constants"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    MessageSquare,
    Send,
    Mail,
    Bell,
    MessageCircle,
}

export function Channels(): React.ReactElement {
    return (
        <section id="channels" className="py-20 bg-muted/30">
            <Container>
                <SectionHeading
                    title="Все каналы в одном API"
                    subtitle="Подключите ваших провайдеров — мы даём единый интерфейс"
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {CHANNELS.map((channel) => {
                        const Icon = iconMap[channel.icon]
                        return (
                            <Card
                                key={channel.name}
                                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <CardContent className="p-6">
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${channel.color}`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{channel.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {channel.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {channel.providers.map((provider) => (
                                            <span
                                                key={provider}
                                                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                                            >
                                                {provider}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </Container>
        </section>
    )
}
