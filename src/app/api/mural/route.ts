import { auth } from "@/lib/auth";
import { createMessage, listMessagesForViewer } from "@/lib/mural";
import { isSameOriginMutation } from "@/lib/mural-request-security";

export async function GET() {
  try {
    const session = await auth();
    return Response.json(await listMessagesForViewer(session?.user?.githubId));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar o mural" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Origem inválida" }, { status: 403 });
  const session = await auth();
  if (!session?.user?.githubId || !session.user.login) return Response.json({ error: "Faça login com GitHub para publicar" }, { status: 401 });
  try {
    const payload = await request.json();
    const message = await createMessage({ body: payload.body, githubId: session.user.githubId, login: session.user.login, avatarUrl: session.user.image || `https://github.com/${session.user.login}.png` });
    return Response.json({ message }, { status: 201 });
  } catch (error) {
    const text = error instanceof Error ? error.message : "Não foi possível publicar";
    return Response.json({ error: text }, { status: text.includes("minuto") ? 429 : 422 });
  }
}
