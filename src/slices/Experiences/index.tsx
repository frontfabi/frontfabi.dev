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
              <Link
                href={
                  experience.url || `/trabalho/profissional/${experience.uid}`
                }
              >
                <strong>{experience.data?.company || experience.uid}</strong>
                <span>{experience.data?.jobTitle}</span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}
