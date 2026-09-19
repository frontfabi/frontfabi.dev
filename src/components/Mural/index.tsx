"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import type { MuralMessageForViewer } from "@/lib/mural";
import { muralPath } from "@/lib/seo";

const ownerAvatar =
  "https://images.prismic.io/frontfabi/Z5jwp5bqstJ998QQ_fabi_avatar.gif?auto=format%2Ccompress&rect=41%2C0%2C611%2C611&w=3840&fit=max";

export default function Mural({ onLogin }: { onLogin: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MuralMessageForViewer[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user?.githubId);
  useEffect(() => {
    fetch("/api/mural")
      .then(async (response) => {
        if (!response.ok) return;
        setMessages(await response.json());
      })
      .catch(() => setError("Não foi possível carregar o mural agora."));
  }, []);
  const publish = async () => {
    if (sending) return;
    setSending(true);
    setError("");
    setFeedback(null);
    try {
      const response = await fetch("/api/mural", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: message }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível publicar.");
        setFeedback({
          kind: response.status === 429 ? "warning" : "error",
          text:
            response.status === 429
              ? "Aguarde para reenviar"
              : "Falha ao enviar",
        });
        return;
      }
      setMessages((current) => [data.message, ...current]);
      setMessage("");
      setFeedback({ kind: "success", text: "Recado publicado!" });
    } catch {
      setError(
        "Não foi possível confirmar o envio. Verifique sua conexão e tente novamente.",
      );
      setFeedback({ kind: "error", text: "Falha ao enviar" });
    } finally {
      setSending(false);
    }
  };
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const remove = async (id: string) => {
    if (deletingId || !window.confirm("Excluir este comentário?")) return;
    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`/api/mural/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Não foi possível excluir o comentário.");
        return;
      }
      setMessages((current) => current.filter((message) => message.id !== id));
    } catch {
      setError("Não foi possível excluir o comentário.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mural-widget">
      <div
        className="mural-feedback-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback && (
          <div className={`mural-feedback mural-feedback--${feedback.kind}`}>
            <span aria-hidden="true">●</span>
            {feedback.text}
          </div>
        )}
      </div>
      <div className="mural-history" aria-label="Mensagens do mural">
        {messages.length ? (
          messages.map((item) => (
            <article className="mural-message" key={item.id}>
              <img src={item.avatarUrl} alt="" />
              <p>
                <b>@{item.login}</b>
                <br />
                {item.body}
              </p>
              {item.canDelete && (
                <button
                  className="mural-delete"
                  type="button"
                  aria-label="Excluir seu comentário"
                  title="Excluir comentário"
                  disabled={deletingId === item.id}
                  onClick={() => remove(item.id)}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 4h10M6 4V2h4v2m-5 0 .6 10h4.8L11 4M7 7v4m2-4v4" />
                  </svg>
                </button>
              )}
            </article>
          ))
        ) : (
          <p className="mural-empty">Ainda não há recados. Deixe o primeiro.</p>
        )}
      </div>
      <aside className="mural-avatars" aria-label="Participantes">
        <div>
          <img src={ownerAvatar} alt="Avatar de Fabi" />
          <span>fabi</span>
        </div>
        <div className="mural-visitor-avatar" aria-label="Seu avatar">
          {session?.user?.image ? (
            <img src={session.user.image} alt="Seu avatar" />
          ) : (
            <span>?</span>
          )}
          <span>{signedIn ? `@${session!.user.login}` : "você"}</span>
        </div>
      </aside>
      <form
        className="mural-composer"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="mural-message">seu recado</label>
        <textarea
          id="mural-message"
          value={message}
          disabled={!signedIn || sending}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Entre com GitHub para deixar um recado"
        />
        {error && <p className="mural-error">{error}</p>}
        <button
          type="button"
          disabled={sending}
          onClick={signedIn ? publish : onLogin}
        >
          {sending ? "Publicando…" : signedIn ? "Publicar" : "Logar"}
        </button>
      </form>
    </div>
  );
}

export function MuralLogin() {
  return (
    <div className="mural-login-content">
      <p className="mural-login-mark">●◕●</p>
      <h2>oi :)</h2>
      <p>Entre com sua conta para deixar um recado no mural da Fabi.</p>
      <button
        type="button"
        onClick={() =>
          signIn("github", { callbackUrl: muralPath(window.location.pathname) })
        }
      >
        Entrar com GitHub
      </button>
      <small>Seu @username e avatar serão exibidos no comentário.</small>
    </div>
  );
}
