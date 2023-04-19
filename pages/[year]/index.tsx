import { useRouter } from "next/router";
import { Post } from "@/pages/api/types";
import { HandlePostDate, Posts } from "@/pages/api/posts";
import { GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";

interface Props {
  posts: Post[] | undefined;
}

export default function Post({ posts }: Props) {
  const router = useRouter();
  return (
    <div>
      <div>{router.query.year}</div>
    </div>
  );
}

export async function getStaticPaths() {
  const posts = Posts();
  const years = [
    ...[
      ...new Set(
        posts.map((post) => {
          HandlePostDate(post).year;
        })
      ).keys(),
    ].map((year) => String(year)),
  ];

  return {
    paths: years.map((year) => {
      return {
        params: {
          year,
        },
      };
    }),
    fallback: false,
  };
}

interface Params extends ParsedUrlQuery {
  year: string;
}

// NOTE: 文件名视为 url 的一部分，只需要查询最后一个字段即可。
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { year } = params as Params;
  const posts = Posts();

  return {
    props: {
      posts: posts.filter((p) => {
        const date = new Date(p.frontMatter["date"] as string);
        return date.getFullYear() === parseInt(year, 10);
      }),
    },
  };
};
