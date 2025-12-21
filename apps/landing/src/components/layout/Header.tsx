"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { Container } from "@/components/shared/Container"
import { NAV_ITEMS } from "@/lib/constants"
import { cn } from "@/lib/utils"

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

function DesktopNav(): React.ReactElement {
    return (
        <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    {item.label}
                </Link>
            ))}
            <Link
                href="https://github.com/opennotify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                <GitHubIcon className="h-5 w-5" />
            </Link>
        </div>
    )
}

function DesktopActions(): React.ReactElement {
    return (
        <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
                Войти
            </Button>
            <Button size="sm">Начать бесплатно</Button>
        </div>
    )
}

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps): React.ReactElement | null {
    if (!isOpen) {
        return null
    }

    return (
        <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={onClose}
                    >
                        {item.label}
                    </Link>
                ))}
                <Link
                    href="https://github.com/opennotify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                    <GitHubIcon className="h-4 w-4" />
                    GitHub
                </Link>
                <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                        Войти
                    </Button>
                    <Button className="w-full">Начать бесплатно</Button>
                </div>
            </div>
        </div>
    )
}

export function Header(): React.ReactElement {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        function handleScroll(): void {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    function toggleMobileMenu(): void {
        setIsMobileMenuOpen((prev) => !prev)
    }

    function closeMobileMenu(): void {
        setIsMobileMenuOpen(false)
    }

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-background/80 backdrop-blur-lg border-b" : "bg-transparent",
            )}
        >
            <Container>
                <nav className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">ON</span>
                        </div>
                        <span className="font-semibold text-lg">OpenNotify</span>
                    </Link>

                    <DesktopNav />
                    <DesktopActions />

                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </nav>

                <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
            </Container>
        </header>
    )
}
