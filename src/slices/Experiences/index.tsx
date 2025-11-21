import { ProfessionalRow } from "@/components/ProfessionalRow";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { FC } from "react";
import * as S from "./styles";

/**
 * Props for `Experiences`.
 */
export type ExperiencesProps = SliceComponentProps<Content.ExperiencesSlice>;

/**
 * Component for "Experiences" Slices.
 */
const Experiences: FC<ExperiencesProps> = ({ slice }) => {
  const content = slice.primary;
  const experiences = content.xp_list
    .filter((xp) => xp.experience)
    .map((xp) => ({ ...xp.experience?.data, slug: xp.experience?.slug }));
  console.log("experiences", content, experiences);
  return (
    <S.StyledExperience
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <S.BlockHeader>
        <h2>{content.name}</h2>
      </S.BlockHeader>
      <S.BlockList>
        {experiences.map((xp) => (
          <ProfessionalRow {...xp} key={xp.slug} />
        ))}
      </S.BlockList>
    </S.StyledExperience>
  );
};

export default Experiences;
