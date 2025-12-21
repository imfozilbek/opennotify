import "./globals.css"
import { RootProvider } from "fumadocs-ui/provider/next"
import { Inter, JetBrains_Mono } from "next/font/google"
import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
    display: "swap",
})

const jetbrains = JetBrains_Mono({
    subsets: ["latin", "cyrillic"],
    variable: "--font-jetbrains",
    display: "swap",
})

const BASE_URL = "https://docs.opennotify.uz"

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
}

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "OpenNotify Docs",
        template: "%s | OpenNotify Docs",
    },
    description:
        "Developer documentation for OpenNotify - Unified Notification API for Uzbekistan and Central Asia. Send SMS, Telegram, Email, Push, and WhatsApp with one API.",
    keywords: [
        "OpenNotify",
        "notifications",
        "Uzbekistan",
        "API",
        "SMS",
        "Telegram",
        "Eskiz",
        "notification gateway",
        "developer docs",
        "SDK",
        "notification integration",
    ],
    authors: [{ name: "OpenNotify", url: "https://opennotify.uz" }],
    creator: "OpenNotify",
    publisher: "OpenNotify",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-touch-icon.png",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: BASE_URL,
        siteName: "OpenNotify Docs",
        title: "OpenNotify Docs",
        description:
            "Developer documentation for OpenNotify - Unified Notification API for Uzbekistan and Central Asia.",
    },
    twitter: {
        card: "summary_large_image",
        title: "OpenNotify Docs",
        description:
            "Developer documentation for OpenNotify - Unified Notification API for Uzbekistan and Central Asia.",
        creator: "@opennotify",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: BASE_URL,
    },
}

export default function RootLayout({ children }: { children: ReactNode }): React.JSX.Element {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${jetbrains.variable}`}
            suppressHydrationWarning
        >
            <body className="flex min-h-screen flex-col">
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    )
}
