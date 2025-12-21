import { source } from "@/lib/source"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"
import { notFound } from "next/navigation"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { Callout } from "fumadocs-ui/components/callout"
import { Card, Cards } from "fumadocs-ui/components/card"
import type { Metadata } from "next"
import type { MDXComponents } from "mdx/types"

const BASE_URL = "https://docs.opennotify.uz"

interface PageProps {
    params: Promise<{ slug?: string[] }>
}

const mdxComponents: MDXComponents = {
    ...(defaultMdxComponents as MDXComponents),
    Tab,
    Tabs,
    Callout,
    Card,
    Cards,
}

export default async function Page(props: PageProps): Promise<React.JSX.Element> {
    const params = await props.params
    const page = source.getPage(params.slug)

    if (!page) {
        notFound()
    }

    const MDX = page.data.body

    return (
        <DocsPage toc={page.data.toc} full={page.data.full}>
            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <DocsBody>
                <MDX components={mdxComponents} />
            </DocsBody>
        </DocsPage>
    )
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
    return source.generateParams()
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params
    const page = source.getPage(params.slug)

    if (!page) {
        notFound()
    }

    const title = page.data.title
    const description = page.data.description
    const url = `${BASE_URL}${page.url}`

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${title} | OpenNotify Docs`,
            description,
            url,
            siteName: "OpenNotify Docs",
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | OpenNotify Docs`,
            description,
        },
    }
}
