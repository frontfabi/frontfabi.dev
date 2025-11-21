"use client";

import styled from "styled-components";
import { PrismicNextImage } from "@prismicio/next";

export const StyledRow = styled.article`
  padding: 8px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
`;

export const Avatar = styled(PrismicNextImage)`
  border-radius: 8px;
`;

export const Content = styled.div`
  display: flex;
  gap: 16px;
`

export const Dates = styled.div`
  text-align: right;
  max-width: 120px;
`;
