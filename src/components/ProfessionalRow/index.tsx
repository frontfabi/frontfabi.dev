import { formatDistance, format } from "date-fns";
import * as S from "./styles";
type ProfessionalRowProps = {
  company: string;
  jobTitle: string;
  description: string;
  startDate: string;
  endDate?: string;
  tools: { tool: { data: { name: string } } }[];
  logo: any;
};
export const ProfessionalRow = ({
  company,
  jobTitle,
  description,
  startDate,
  endDate,
  tools,
  logo,
}: ProfessionalRowProps) => {
  const formDate = (date: string, formatStr: string) => format(new Date(date), formatStr);
  return (
    <S.StyledRow className="professional-row">
      <S.Content>
        <S.Avatar field={logo} width={80} height={80} />
        <div>
          <h3 className="title">{company}</h3>
          <h4>{jobTitle}</h4>
          <p>{description}</p>
          <p>
            Tecnologias: {tools.map((item) => item.tool.data.name).join(", ")}
          </p>
        </div>
      </S.Content>
      <S.Dates>
        <strong>
          {formDate(startDate, "LLL/yy")} até{" "}
          {endDate ? formDate(endDate, "LLL/yy") : "agora"}
        </strong>
        <p>
          {formatDistance(
            new Date(startDate),
            new Date(endDate ? endDate : new Date())
          )}
        </p>
      </S.Dates>
    </S.StyledRow>
  );
};
