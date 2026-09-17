import { NextRequest } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";

import { createClient, routesForTypes } from "@/prismicio";

/**
 * This endpoint handles previews that are launched from the Page Builder.
 */
export async function GET(request: NextRequest) {
  const repository = await createClient().getRepository();
  const client = createClient({ routes: routesForTypes(repository.types) });

  return await redirectToPreviewURL({ client, request });
}
