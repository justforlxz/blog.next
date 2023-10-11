import React from "react";

export default async function hello() {
  const res = await fetch(
    "https://raw.githubusercontent.com/justforlxz/blog.next/master/README.md",
  );
  return <div>{await res.text()}</div>;
}
