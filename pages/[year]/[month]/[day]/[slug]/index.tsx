import { Post } from "@/pages/api/types";
import {
  HandlePostDate,
  getAllPostsWithFrontMatter,
  getPostBySlug,
} from "@/pages/api/posts";
import { GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import ReactMarkdown from "react-markdown";
import { BlogLayout } from "@/pages/layouts/BlogLayout";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Props {
  post: Post;
}

export default function Post({ post }: Props) {
  return (
    <BlogLayout frontMatter={post.frontMatter}>
      <ReactMarkdown
        components={{
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="code-block">
                <SyntaxHighlighter language={match[1]} style={vscDarkPlus}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {post.content}
      </ReactMarkdown>
    </BlogLayout>
  );
}

export async function getStaticPaths() {
  const posts = getAllPostsWithFrontMatter("_posts");
  return {
    paths: posts.map((post) => {
      const { year, month, day } = HandlePostDate(post);
      return {
        params: {
          year: String(year),
          month: String(month),
          day: String(day),
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}

interface Params extends ParsedUrlQuery {
  slug: string;
}

// NOTE: 文件名视为 url 的一部分，只需要查询最后一个字段即可。
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { slug } = params as Params;
  return {
    props: {
      post: getPostBySlug("_posts", slug),
    },
  };
};
