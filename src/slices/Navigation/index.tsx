import { isFilled, type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import type { SliceComponentProps } from "@prismicio/react";
export default function Navigation({
  slice,
}: SliceComponentProps<Content.NavigationSlice>) {
  return (
    <nav aria-label="Menu" className="category-links">
      {slice.primary.navList.map((item, i) =>
        isFilled.contentRelationship(item.link) ? (
          <PrismicNextLink key={i} field={item.link}>
            {item.label || item.link.uid}
          </PrismicNextLink>
        ) : null,
      )}
    </nav>
  );
}
