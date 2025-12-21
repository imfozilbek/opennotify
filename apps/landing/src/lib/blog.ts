import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export interface BlogPost {
    slug: string
    title: string
    description: string
    date: string
    author: string
    authorRole?: string
    category: string
    tags: string[]
    image?: string
    readingTime: string
    content: string
}

export interface BlogPostMeta {
    slug: string
    title: string
    description: string
    date: string
    author: string
    authorRole?: string
    category: string
    tags: string[]
    image?: string
    readingTime: string
}

interface FrontMatter {
    title?: string
    description?: string
    date?: string
    author?: string
    authorRole?: string
    category?: string
    tags?: string[]
    image?: string
}

function ensureBlogDir(): void {
    if (!fs.existsSync(BLOG_DIR)) {
        fs.mkdirSync(BLOG_DIR, { recursive: true })
    }
}

export function getAllPosts(): BlogPostMeta[] {
    ensureBlogDir()

    const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"))

    const posts = files.map((file) => {
        const filePath = path.join(BLOG_DIR, file)
        const fileContent = fs.readFileSync(filePath, "utf-8")
        const { data, content } = matter(fileContent)
        const frontMatter = data as FrontMatter
        const slug = file.replace(".mdx", "")

        return {
            slug,
            title: frontMatter.title ?? "Untitled",
            description: frontMatter.description ?? "",
            date: frontMatter.date ?? new Date().toISOString(),
            author: frontMatter.author ?? "OpenNotify Team",
            authorRole: frontMatter.authorRole,
            category: frontMatter.category ?? "Общее",
            tags: frontMatter.tags ?? [],
            image: frontMatter.image,
            readingTime: readingTime(content).text.replace("min read", "мин"),
        }
    })

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
    ensureBlogDir()

    const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
        return null
    }

    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(fileContent)
    const frontMatter = data as FrontMatter

    return {
        slug,
        title: frontMatter.title ?? "Untitled",
        description: frontMatter.description ?? "",
        date: frontMatter.date ?? new Date().toISOString(),
        author: frontMatter.author ?? "OpenNotify Team",
        authorRole: frontMatter.authorRole,
        category: frontMatter.category ?? "Общее",
        tags: frontMatter.tags ?? [],
        image: frontMatter.image,
        readingTime: readingTime(content).text.replace("min read", "мин"),
        content,
    }
}

export function getPostsByCategory(category: string): BlogPostMeta[] {
    return getAllPosts().filter((post) => post.category === category)
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
    return getAllPosts().filter((post) => post.tags.includes(tag))
}

export function getAllCategories(): string[] {
    const posts = getAllPosts()
    return [...new Set(posts.map((post) => post.category))]
}

export function getAllTags(): string[] {
    const posts = getAllPosts()
    return [...new Set(posts.flatMap((post) => post.tags))]
}
