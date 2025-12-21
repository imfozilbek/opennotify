import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { SocialProof } from "@/components/sections/SocialProof"
import { ProblemSolution } from "@/components/sections/ProblemSolution"
import { Channels } from "@/components/sections/Channels"
import { Features } from "@/components/sections/Features"
import { CodeExamples } from "@/components/sections/CodeExamples"
import { SavingsCalculator } from "@/components/sections/SavingsCalculator"
import { Testimonials } from "@/components/sections/Testimonials"
import { Pricing } from "@/components/sections/Pricing"
import { FAQ } from "@/components/sections/FAQ"
import { FinalCTA } from "@/components/sections/FinalCTA"

export default function HomePage(): React.ReactElement {
    return (
        <>
            <Header />
            <main>
                <Hero />
                <SocialProof />
                <ProblemSolution />
                <Channels />
                <Features />
                <CodeExamples />
                <SavingsCalculator />
                <Testimonials />
                <Pricing />
                <FAQ />
                <FinalCTA />
            </main>
            <Footer />
        </>
    )
}
