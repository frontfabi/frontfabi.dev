import Link from "next/link";
import { isFilled, type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
export default function Experiences({
  slice,
}: SliceComponentProps<Content.ExperiencesSlice>) {
  return (
    <section data-slice-type={slice.slice_type}>
      <h2>{slice.primary.name}</h2>
      <ul className="file-list">
        {slice.primary.xp_list.map(({ experience }) =>
          isFilled.contentRelationship(experience) ? (
            <li key={experience.id}>
              <article
                aria-labelledby={`experience-${slice.id}-${experience.id}`}
              >
                <Link
                  aria-labelledby={`experience-${slice.id}-${experience.id}`}
                  href={
                    experience.url || `/trabalho/profissional/${experience.uid}`
                  }
                >
                  <h3 id={`experience-${slice.id}-${experience.id}`}>
                    {experience.data?.company || experience.uid}
                  </h3>
                  <span>{experience.data?.jobTitle}</span>
                </Link>
              </article>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
