import { HandlePostDate, getAllPostsWithFrontMatter } from "@/pages/api/posts";
import { PostWithFrontMatter } from "@/pages/api/types";
import { GetStaticProps } from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import React, { FC } from "react";

interface Props {
  page: number;
  posts: PostWithFrontMatter[];
  hasPrevious: boolean;
  hasNext: boolean;
}

function getPagesData() {
  const posts = getAllPostsWithFrontMatter("_posts");
  let len = posts.length;
  const pageCount = 10;
  let lineNum =
    len % pageCount === 0 ? len / pageCount : Math.floor(len / pageCount + 1);
  let res = [];
  for (let i = 0; i < lineNum; i++) {
    let temp = posts.slice(i * pageCount, i * pageCount + pageCount);
    res.push(temp);
  }
  return res;
}

export async function getStaticPaths() {
  const posts = getPagesData();
  return {
    paths: [
      {
        params: {
          page: [],
        },
      },
      ...posts.map((_, index) => {
        return {
          params: {
            page: [index.toString()],
          },
        };
      }),
    ],
    fallback: false,
  };
}

interface Params extends ParsedUrlQuery {
  page?: string;
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { page } = params as Params;
  let index = 0;
  if (page) {
    index = parseInt(page, 10);
  }

  const posts = getPagesData();

  console.log(index);

  return {
    props: {
      page: index,
      posts: posts[index],
      hasNext: posts.length > index + 1,
      hasPrevious: posts.length > 0 && index > 0,
    },
  };
};

const Page: FC<Props> = ({ page, posts, hasNext, hasPrevious }) => {
  console.log(page);
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
      <div>
        {hasPrevious ? (
          <Link href={`/page/${page == 1 ? "" : page - 1}`}>上一页</Link>
        ) : (
          <></>
        )}
        {hasNext ? <Link href={`/page/${page + 1}`}>下一页</Link> : <></>}
      </div>
    </div>
  );
};

export default Page;
