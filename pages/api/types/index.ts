export interface FrontMatter {
  [key: string]: string | string[];
}

export interface Post {
  frontMatter: FrontMatter;
  content: string;
  file: string;
  excerpt: string;
}
