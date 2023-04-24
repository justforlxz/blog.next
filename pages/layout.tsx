import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <div className="menu">
          <Link href="/">home</Link>
          <Link href="/page/1">blog</Link>
        </div>
      </header>
      <main>{children}</main>
      <footer></footer>
    </>
  );
}
