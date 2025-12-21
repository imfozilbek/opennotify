import Link from "next/link"

export default function HomePage(): React.ReactElement {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
            <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-500" />
                    <span className="text-2xl font-bold">OpenNotify</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    Developer Documentation
                </h1>

                <p className="max-w-2xl text-lg text-muted-foreground">
                    The unified notification API for Uzbekistan and Central Asia. One integration
                    for SMS, Telegram, Email, Push, and WhatsApp.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                        href="/docs"
                        className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/docs/api-reference"
                        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        API Reference
                    </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Channels", value: "5" },
                        { label: "Providers", value: "10+" },
                        { label: "SDKs", value: "8" },
                        { label: "Uptime", value: "99.9%" },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-border p-4">
                            <div className="text-2xl font-bold text-blue-500">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
