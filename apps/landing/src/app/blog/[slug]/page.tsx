import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Share2, Tag, User } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Container } from "@/components/shared/Container"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { MDXContent } from "@/components/blog/MDXContent"

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export function generateStaticParams(): { slug: string }[] {
    const posts = getAllPosts()
    return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
    params,
}: BlogPostPageProps): Promise<{ title: string; description: string }> {
    const { slug } = await params
    const post = getPostBySlug(slug)

    if (!post) {
        return {
            title: "Статья не найдена",
            description: "",
        }
    }

    return {
        title: `${post.title} | OpenNotify Blog`,
        description: post.description,
    }
}

function RelatedPosts({ currentSlug }: { currentSlug: string }): React.ReactElement | null {
    const allPosts = getAllPosts()
    const relatedPosts = allPosts.filter((post) => post.slug !== currentSlug).slice(0, 3)

    if (relatedPosts.length === 0) {
        return null
    }

    return (
        <section className="py-16 bg-muted/30">
            <Container>
                <h2 className="text-2xl font-bold mb-8">Читайте также</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((post) => (
                        <Card key={post.slug} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <Badge variant="secondary" className="mb-3">
                                    {post.category}
                                </Badge>
                                <Link href={`/blog/${post.slug}`}>
                                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                </Link>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {post.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    )
}

export default async function BlogPostPage({
    params,
}: BlogPostPageProps): Promise<React.ReactElement> {
    const { slug } = await params
    const post = getPostBySlug(slug)

    if (!post) {
        notFound()
    }

    return (
        <>
            <Header />
            <main className="pt-24 pb-16">
                <article>
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Назад к блогу
                            </Link>

                            <header className="mb-12">
                                <Badge className="mb-4">{post.category}</Badge>
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                                    {post.title}
                                </h1>
                                <p className="text-xl text-muted-foreground mb-8">
                                    {post.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-8 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {post.author}
                                            </div>
                                            {post.authorRole && (
                                                <div className="text-xs">{post.authorRole}</div>
                                            )}
                                        </div>
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
                            </header>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
                                <MDXContent content={post.content} />
                            </div>

                            {post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-8 border-t mb-8">
                                    {post.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-8 border-t">
                                <Button variant="outline" asChild>
                                    <Link href="/blog">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Все статьи
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Container>
                </article>

                <RelatedPosts currentSlug={slug} />
            </main>
            <Footer />
        </>
    )
}
