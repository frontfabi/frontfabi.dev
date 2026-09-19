import { auth } from "@/lib/auth";
import { deleteMessage } from "@/lib/mural";
import { isSameOriginMutation } from "@/lib/mural-request-security";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "Origem inválida" }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.githubId) {
    return Response.json({ error: "Faça login com GitHub para excluir" }, { status: 401 });
  }

  const deleted = await deleteMessage({
    id: (await params).id,
    githubId: session.user.githubId,
  });
  if (!deleted) return Response.json({ error: "Comentário não encontrado" }, { status: 404 });
  return new Response(null, { status: 204 });
}
