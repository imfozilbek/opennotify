import { Container } from "@/components/shared/Container"

const clients = ["Payme", "Click", "Uzum", "Humans", "MyTaxi", "Oson", "Billz", "Workly"]

export function SocialProof(): React.ReactElement {
    return (
        <section className="py-12 border-y bg-muted/30">
            <Container>
                <p className="text-center text-sm text-muted-foreground mb-8">
                    Более <span className="font-semibold text-foreground">50+ компаний</span> уже
                    используют OpenNotify
                </p>

                {/* Logo marquee */}
                <div className="relative overflow-hidden">
                    <div className="flex animate-marquee">
                        {[...clients, ...clients].map((client, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 mx-8 flex items-center justify-center"
                            >
                                <span className="text-xl font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                                    {client}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </div>
            </Container>
        </section>
    )
}
