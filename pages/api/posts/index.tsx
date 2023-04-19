import { Post } from "@/pages/api/types";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

export function Posts(): Post[] {
  const files = fs
    .readdirSync("source/_posts/")
    .filter((file) => path.extname(file) == ".md");
  return files.map((file) => {
    const source = fs.readFileSync(`source/_posts/${file}`, "utf8");
    const { data, content } = matter(source, {
      excerpt_separator: "<!-- more -->",
    });
    // NOTE: mother fucker Date type
    data.date = data.date.toString();
    return { frontMatter: data, content: content, file: file } as Post;
  });
}

export function HandlePostDate(post: Post): {
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
