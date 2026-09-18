"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import type { MuralMessage } from "@/lib/mural";

const ownerAvatar =
  "https://images.prismic.io/frontfabi/Z5jwp5bqstJ998QQ_fabi_avatar.gif?auto=format%2Ccompress&rect=41%2C0%2C611%2C611&w=3840&fit=max";

export default function Mural({ onLogin }: { onLogin: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MuralMessage[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const { data: session } = useSession();
  const signedIn = Boolean(session?.user?.githubId);
  useEffect(() => {
    fetch("/api/mural").then(async (response) => {
      if (!response.ok) return;
      setMessages(await response.json());
    }).catch(() => setError("Não foi possível carregar o mural agora."));
  }, []);
  const publish = async () => {
    setSending(true); setError("");
    const response = await fetch("/api/mural", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body: message }) });
    const data = await response.json();
    setSending(false);
    if (!response.ok) return setError(data.error || "Não foi possível publicar.");
    setMessages((current) => [data.message, ...current]); setMessage("");
  };

  return (
    <div className="mural-widget">
      <div className="mural-history" aria-label="Mensagens do mural">
        {messages.length ? messages.map((item) => <article className="mural-message" key={item.id}><img src={item.avatarUrl} alt="" /><p><b>@{item.login}</b><br />{item.body}</p></article>) : <p className="mural-empty">Ainda não há recados. Deixe o primeiro.</p>}
      </div>
      <aside className="mural-avatars" aria-label="Participantes">
        <div>
          <img src={ownerAvatar} alt="Avatar de Fabi" />
          <span>fabi</span>
        </div>
        <div className="mural-visitor-avatar" aria-label="Seu avatar">
          {session?.user?.image ? <img src={session.user.image} alt="Seu avatar" /> : <span>?</span>}
          <span>{signedIn ? `@${session!.user.login}` : "você"}</span>
        </div>
      </aside>
      <form className="mural-composer" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="mural-message">seu recado</label>
        <textarea
          id="mural-message"
          value={message}
          disabled={!signedIn}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Entre com GitHub para deixar um recado"
        />
        {error && <p className="mural-error">{error}</p>}
        <button type="button" disabled={sending} onClick={signedIn ? publish : onLogin}>
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
      <button type="button" onClick={() => signIn("github", { callbackUrl: "/?mural=1" })}>Entrar com GitHub</button>
      <small>Seu @username e avatar serão exibidos no comentário.</small>
    </div>
  );
}
