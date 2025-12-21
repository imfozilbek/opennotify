import Link from "next/link"
import { Send } from "lucide-react"
import { Container } from "@/components/shared/Container"

function GitHubIcon({ className }: { className?: string }): React.ReactElement {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    )
}

const footerLinks = {
    product: [
        { label: "Возможности", href: "#features" },
        { label: "Каналы", href: "#channels" },
        { label: "Цены", href: "#pricing" },
        { label: "Roadmap", href: "#" },
    ],
    resources: [
        { label: "Документация", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "SDK", href: "#" },
        { label: "Статус", href: "#" },
    ],
    company: [
        { label: "О нас", href: "#" },
        { label: "Блог", href: "#" },
        { label: "Контакты", href: "#" },
    ],
    legal: [
        { label: "Политика конфиденциальности", href: "#" },
        { label: "Условия использования", href: "#" },
    ],
}

function FooterLinks(): React.ReactElement {
    return (
        <>
            <div>
                <h4 className="font-semibold mb-4">Продукт</h4>
                <ul className="space-y-3">
                    {footerLinks.product.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold mb-4">Ресурсы</h4>
                <ul className="space-y-3">
                    {footerLinks.resources.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold mb-4">Компания</h4>
                <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold mb-4">Правовая информация</h4>
                <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export function Footer(): React.ReactElement {
    return (
        <footer className="border-t bg-background/50">
            <Container className="py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">
                                    ON
                                </span>
                            </div>
                            <span className="font-semibold">OpenNotify</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4">
                            Единый API для всех каналов уведомлений
                        </p>
                        <div className="flex gap-3">
                            <Link
                                href="https://github.com/opennotify"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <GitHubIcon className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://t.me/opennotify"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Send className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <FooterLinks />
                </div>

                <div className="mt-12 pt-8 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                        © {new Date().getFullYear()} OpenNotify. Все права защищены.
                    </p>
                </div>
            </Container>
        </footer>
    )
}
