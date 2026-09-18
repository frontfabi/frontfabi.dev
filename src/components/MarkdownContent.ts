import { createElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Render only the article body; the page already supplies its title and metadata. */
export default function MarkdownContent({ children }: { children: string }) {
  return createElement(
    "div",
    { className: "dev-article-body" },
    createElement(
      Markdown,
      {
        remarkPlugins: [remarkGfm],
        skipHtml: true,
        components: {
          // Keep the article's main heading outside the Markdown body.
          h1: ({ children }) => createElement("h2", null, children),
        },
      },
      children,
    ),
  );
}
