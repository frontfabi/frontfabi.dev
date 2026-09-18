import {
  createClient as baseCreateClient,
  ClientConfig,
  Route,
} from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../slicemachine.config.json";
import type { SiteDocument } from "@/lib/content-types";
import { locales, localizedPath } from "@/lib/site";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || sm.repositoryName;

/**
 * The project's Prismic route resolvers. This list determines a Prismic document's URL.
 */
const routes: Route[] = Object.entries(locales).flatMap(([locale, lang]) => {
  const prefix = (path: string) =>
    localizedPath(path, locale as keyof typeof locales);
  return [
    { type: "page", lang, uid: "home", path: prefix("/") },
    { type: "page", lang, uid: "xp", path: prefix("/trabalho") },
    { type: "page", lang, path: prefix("/:uid") },
    { type: "experience", lang, path: prefix("/trabalho/profissional/:uid") },
    { type: "community", lang, path: prefix("/trabalho/comunidade/:uid") },
    { type: "post", lang, path: prefix("/articles/:uid") },
  ];
});

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export function createClient(config: ClientConfig = {}) {
  const client = baseCreateClient<SiteDocument>(
    sm.apiEndpoint || repositoryName,
    {
      routes: routes.filter((route) => route.type !== "post"),
      fetchOptions:
        process.env.NODE_ENV === "production"
          ? { next: { tags: ["prismic"], revalidate: 60 } }
          : { next: { revalidate: 5 } },
      ...config,
    },
  );

  enableAutoPreviews({ client });

  return client;
}

export function routesForTypes(types: Record<string, string>) {
  return routes.filter((route) => route.type && route.type in types);
}
