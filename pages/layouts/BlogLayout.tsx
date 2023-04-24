import { BlogLayoutProps } from "../api/types";

export const BlogLayout: React.FC<BlogLayoutProps> = ({
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
