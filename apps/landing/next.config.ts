import type { NextConfig } from "next"
import createMDX from "@next/mdx"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeHighlight from "rehype-highlight"

const nextConfig: NextConfig = {
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [],
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion"],
    },
}

const withMDX = createMDX({
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeHighlight],
    },
})

export default withMDX(nextConfig)
