import { BlogLayoutProps } from "../api/types";
import { FC } from "react";

export const BlogLayout: FC<BlogLayoutProps> = ({
  children,
  frontMatter,
}) => {
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
