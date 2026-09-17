import { isFilled, type Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { period } from "@/lib/content";
import type { Locale } from "@/lib/site";
export const ProfessionalRow = ({
  company,
  jobTitle,
  description,
  startDate,
  endDate,
  tools,
  logo,
  locale = "pt",
}: Content.ExperienceDocument["data"] & { locale?: Locale }) => (
  <div className="professional-row">
    <div className="experience-heading">
      <PrismicNextImage field={logo} width={50} height={50} />
      <div>
        <h2>{jobTitle || company}</h2>
        <p className="meta">{period(startDate, endDate, locale)}</p>
      </div>
    </div>
    <PrismicRichText field={description} />
    {!!tools.length && (
      <>
        <h3>Stack</h3>
        <ul className="tags">
          {tools.map(({ tool }, i) =>
            isFilled.contentRelationship(tool) && tool.data?.name ? (
              <li key={tool.id || i}>{tool.data.name}</li>
            ) : null,
          )}
        </ul>
      </>
    )}
  </div>
);
