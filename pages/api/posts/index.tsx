import { Post, PostWithFrontMatter } from "@/pages/api/types";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

const root = process.cwd();

export async function getFiles(dataType: string) {
  return fs.readdirSync(path.join(root, "source", dataType), "utf-8");
}

export function getPostBySlug(dataType: string, slug: string): Post {
  const { data, excerpt, content } = matter.read(path.join(root, "source", dataType, `${slug}.md`), {excerpt_separator: '<!-- more -->'});
  // NOTE: mother fucker Date type
  data.date = data.date.toString();
  return {
    frontMatter: data,
    content: content,
    slug: slug,
    excerpt: excerpt,
  };
}

export function getAllPostsWithFrontMatter(
  dataType: string
): PostWithFrontMatter[] {
  const files = fs
    .readdirSync(path.join(root, "source", dataType), "utf-8")
    .filter((file) => path.extname(file) == ".md");

  // @ts-ignore
  return files.reduce((allPosts, postSlug) => {
  const { data, excerpt } = matter.read(path.join(root, "source", dataType, postSlug), {excerpt_separator: '<!-- more -->'});
    // NOTE: mother fucker Date type
    data.date = data.date.toString();
    return [
      {
        frontMatter: data,
        slug: postSlug.replace(".md", ""),
        excerpt: excerpt,
      },
      ...allPosts,
    ];
  }, []);
}

export function HandlePostDate(post: PostWithFrontMatter): {
  year: number;
  month: number;
  day: number;
} {
  const date = new Date(post.frontMatter["date"] as string);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDay(),
  };
}
