import Link from "next/link";
import NotFoundStatus from "@/components/NotFoundStatus";

export default function NotFound() {
  return (
    <main className="not-found-screen" lang="pt-BR">
      <section className="not-found-window" aria-labelledby="not-found-title">
        <header className="not-found-titlebar">
          <span>frontfabiOS // SYSTEM FAILURE</span>
          <span aria-hidden="true">[×]</span>
        </header>

        <div className="not-found-marquee" aria-label="Aviso de página indisponível">
          <div className="not-found-marquee-track">
            <span className="not-found-marquee-copy">
              A página que você procurou não existe ou foi movida. //
            </span>
            <span className="not-found-marquee-copy" aria-hidden="true">
              A página que você procurou não existe ou foi movida. //
            </span>
          </div>
        </div>

        <div className="not-found-content">
          <p className="not-found-eyebrow">EXCEPTION UNHANDLED</p>
          <h1
            id="not-found-title"
            className="not-found-glitch not-found-attention"
            data-text="FATAL ERROR 0x404"
          >
            FATAL ERROR 0x404
          </h1>
          <p className="not-found-description">
            O sistema não conseguiu localizar este endereço. Nenhum arquivo foi
            apagado — só encontramos um atalho quebrado.
          </p>

          <aside className="not-found-panic" aria-label="Kernel panic">
            <p>KERNEL PANIC</p>
            <strong>WHERE_DID_THE_PAGE_GO?</strong>
            <span>RECOVERY MODE AVAILABLE</span>
          </aside>

          <Link className="not-found-action" href="/">
            ← VOLTAR PARA A BASE
          </Link>
        </div>

        <NotFoundStatus />
      </section>
    </main>
  );
}
