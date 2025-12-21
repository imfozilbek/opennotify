import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin", "cyrillic"],
    variable: "--font-jetbrains",
})

export const metadata: Metadata = {
    title: "OpenNotify — Единый API для уведомлений",
    description:
        "SMS, Telegram, Email, Push, WhatsApp — один API, умная маршрутизация, 70% экономии. Unified notification API для Центральной Азии.",
    keywords: [
        "notification api",
        "sms api",
        "telegram api",
        "email api",
        "push notifications",
        "uzbekistan",
        "central asia",
        "eskiz",
        "playmobile",
    ],
    authors: [{ name: "OpenNotify" }],
    creator: "OpenNotify",
    openGraph: {
        type: "website",
        locale: "ru_RU",
        url: "https://opennotify.dev",
        siteName: "OpenNotify",
        title: "OpenNotify — Единый API для уведомлений",
        description:
            "SMS, Telegram, Email, Push, WhatsApp — один API, умная маршрутизация, 70% экономии.",
    },
    twitter: {
        card: "summary_large_image",
        title: "OpenNotify — Единый API для уведомлений",
        description:
            "SMS, Telegram, Email, Push, WhatsApp — один API, умная маршрутизация, 70% экономии.",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}): React.ReactElement {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
