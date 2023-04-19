import { useRouter } from "next/router";
import { Post } from "@/pages/api/types";
import { HandlePostDate, Posts } from "@/pages/api/posts";
import { GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";

interface Props {
  post: Post;
}

export default function Post({ post }: Props) {
  const router = useRouter();
  return (
    <div>
      <div>{router.query.post}</div>
      {post.frontMatter["title"]}
    </div>
  );
}

export async function getStaticPaths() {
  const posts = Posts();
  return {
    paths: posts.map((post) => {
      const { year, month, day } = HandlePostDate(post);
      return {
        params: {
          year: String(year),
          month: String(month),
          day: String(day),
          post: post.content,
        },
      };
    }),
    fallback: false,
  };
}

interface Params extends ParsedUrlQuery {
  post: string;
}

// NOTE: 文件名视为 url 的一部分，只需要查询最后一个字段即可。
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  console.log(params);
  const { post } = params as Params;
  const posts = Posts();
  const p = posts.find(
    (p) => p.file.substring(0, p.file.lastIndexOf(".")) == post
  );

  if (p === undefined) {
    throw new Error("404");
  }

  return {
    props: {
      post: p,
    },
  };
};
