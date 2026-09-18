import { auth } from "@/lib/auth";
import { createMessage, listMessages } from "@/lib/mural";

export async function GET() {
  try {
    return Response.json(await listMessages());
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar o mural" }, { status: 503 });
  }
}

export async function POST(request: Request) {
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
