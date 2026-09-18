import StyledComponentsRegistry from "./lib/registry";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import { siteUrl } from "@/lib/site";
import Analytics from "@/components/Analytics";
import { SessionProvider } from "next-auth/react";
import "../theme/global.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "frontfabi.dev — Fabiana Rodrigues",
    template: "%s | frontfabi.dev",
  },
  description: "Fabiana Rodrigues — front-end, tecnologia e comunidade.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get("x-site-locale") || "pt-br";
  return (
    <html lang={locale}>
      <body>
        <SessionProvider><StyledComponentsRegistry>{children}</StyledComponentsRegistry></SessionProvider>
        <PrismicPreview repositoryName={repositoryName} />
        <Analytics />
      </body>
    </html>
  );
}
