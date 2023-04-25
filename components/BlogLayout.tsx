import { BlogLayoutProps } from "@/pages/api/types";
import { FC } from "react";

const BlogLayout: FC<BlogLayoutProps> = ({ children, frontMatter }) => {
  return (
    <div>
      <div>
        <div>{frontMatter["title"]}</div>
      </div>
      {children}
      <div>{frontMatter["date"]}</div>
    </div>
  );
};

export default BlogLayout;
