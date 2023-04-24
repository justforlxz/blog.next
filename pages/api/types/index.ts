export interface FrontMatter {
  [key: string]: string | string[];
}

export interface PostWithFrontMatter {
  frontMatter: FrontMatter;
  slug: string;
  excerpt: string | undefined;
}

export interface Post extends PostWithFrontMatter {
  content: string;
}

export type BlogLayoutProps = {
  children: React.ReactNode;
  frontMatter: FrontMatter;
};
