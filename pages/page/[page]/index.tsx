import { HandlePostDate, getAllPostsWithFrontMatter } from "@/pages/api/posts";
import { Post, PostWithFrontMatter } from "@/pages/api/types";
import { GetStaticProps } from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import React, { FC } from "react";

interface Props {
  posts: PostWithFrontMatter[];
}

export async function getStaticPaths() {
  const posts = getAllPostsWithFrontMatter("_posts");

  return {
    paths: [
      ...Object.keys(Array.from({ length: posts.length / 10 })).map((page) => {
        return {
          params: {
            page,
          },
        };
      }),
    ],
    fallback: false,
  };
}

interface Params extends ParsedUrlQuery {
  page: string;
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { page } = params as Params;
  const posts = getAllPostsWithFrontMatter("_posts");
  const index = parseInt(page, 10);

  return {
    props: {
      posts: posts.slice(index, index + 10),
    },
  };
};

const Page: FC<Props> = ({ posts }) => {
  return (
    <div>
      {posts.map((post) => {
        const date = HandlePostDate(post);
        return (
          <div key={post.slug}>
            <Link href={`/${date.year}/${date.month}/${date.day}/${post.slug}`}>
              {post.frontMatter["title"]}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
