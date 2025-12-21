import Link from "next/link"
import { ArrowRight, Calendar, Clock, Tag, User } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllCategories, getAllPosts, type BlogPostMeta } from "@/lib/blog"

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

function BlogPostCard({ post }: { post: BlogPostMeta }): React.ReactElement {
    return (
        <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
            {post.image && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20" />
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readingTime}
                    </span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                    <h2 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h2>
                </Link>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {post.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.date)}</span>
                    </div>
                </div>

                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t">
                        {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function FeaturedPost({ post }: { post: BlogPostMeta }): React.ReactElement {
    return (
        <Card className="group hover:shadow-xl transition-shadow overflow-hidden bg-gradient-to-br from-primary/5 to-violet-500/5">
            <CardContent className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <Badge className="mb-4">Рекомендуем</Badge>
                        <Link href={`/blog/${post.slug}`}>
                            <h2 className="font-bold text-2xl md:text-3xl mb-4 group-hover:text-primary transition-colors">
                                {post.title}
                            </h2>
                        </Link>
                        <p className="text-muted-foreground mb-6">{post.description}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.date)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.readingTime}
                            </div>
                        </div>

                        <Button asChild>
                            <Link href={`/blog/${post.slug}`}>
                                Читать статью
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="aspect-video bg-muted rounded-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-violet-500/30" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CategoryFilter({ categories }: { categories: string[] }): React.ReactElement {
    return (
        <div className="flex flex-wrap gap-2 justify-center mb-12">
            <Badge variant="default" className="cursor-pointer">
                Все статьи
            </Badge>
            {categories.map((category) => (
                <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    {category}
                </Badge>
            ))}
        </div>
    )
}

function EmptyState(): React.ReactElement {
    return (
        <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Скоро здесь появятся статьи</h2>
            <p className="text-muted-foreground mb-6">
                Мы работаем над полезным контентом о уведомлениях, интеграциях и best practices.
            </p>
            <Button asChild>
                <Link href="/">Вернуться на главную</Link>
            </Button>
        </div>
    )
}

function SubscribeSection(): React.ReactElement {
    return (
        <section className="py-20 bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10">
            <Container>
                <div className="text-center max-w-2xl mx-auto">
                    <Badge className="mb-4">Подписка</Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Будьте в курсе новостей
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Подпишитесь на наш Telegram-канал, чтобы получать уведомления о новых
                        статьях, обновлениях продукта и полезных советах.
                    </p>
                    <Button size="lg" asChild>
                        <Link
                            href="https://t.me/opennotify"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Подписаться на Telegram
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </Container>
        </section>
    )
}

export default function BlogPage(): React.ReactElement {
    const posts = getAllPosts()
    const categories = getAllCategories()
    const featuredPost = posts[0]
    const otherPosts = posts.slice(1)

    return (
        <>
            <Header />
            <main className="pt-24 pb-16">
                <Container>
                    <div className="text-center mb-12">
                        <Badge className="mb-4">Блог</Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                            Статьи и руководства
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Полезные материалы о уведомлениях, интеграциях, best practices и
                            обновлениях OpenNotify.
                        </p>
                    </div>

                    {posts.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {categories.length > 0 && <CategoryFilter categories={categories} />}

                            {featuredPost && (
                                <div className="mb-12">
                                    <FeaturedPost post={featuredPost} />
                                </div>
                            )}

                            {otherPosts.length > 0 && (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {otherPosts.map((post) => (
                                        <BlogPostCard key={post.slug} post={post} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </Container>

                <SubscribeSection />
            </main>
            <Footer />
        </>
    )
}
