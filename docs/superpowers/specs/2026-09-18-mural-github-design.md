# Mural GitHub

## Objetivo

Adicionar um mural público de recados ao desktop da home, acessado pelo dock. Não há comentários anônimos: toda publicação é associada à conta GitHub autenticada.

## Experiência

O mural não abre na carga da home. O dock recebe um ícone de conversa com badge rosa (`--pink`), inicialmente um indicador de novidade sem contagem simulada. Ao clicar, abre uma janela com a mesma moldura das janelas existentes: fundo creme, contorno preto fino, sombra deslocada, barra de título compacta e controles de janela.

O painel superior contém o histórico de mensagens. A faixa inferior contém o campo de recado e a ação principal. A coluna lateral mostra, acima, o GIF real da Fabi vindo do Prismic e, abaixo, o avatar real do visitante autenticado, retornado pelo GitHub.

### Deslogado

O histórico permanece legível. O campo é desabilitado. A ação diz `Logar`; ao acioná-la, abre uma segunda janela, inspirada na tela de login do MSN mas com a moldura do frontfabi, contendo apenas `Entrar com GitHub`.

### Logado

Após o callback OAuth, a janela de login fecha. O mural exibe avatar e `@username`, habilita o campo e troca a ação para `Publicar`. Cada comentário guarda a identidade pública do GitHub no momento da publicação: id, login e URL do avatar.

## Arquitetura

- Next.js App Router hospeda o widget, a janela de login e as rotas de API.
- Auth.js usa exclusivamente o provider GitHub e protege a criação de mensagens no servidor.
- Prismic continua sendo a origem do GIF da Fabi e do conteúdo editorial; não é usado como banco público de comentários.
- Um banco compatível com Vercel Postgres/Neon armazena comentários. A tabela inclui id, conteúdo limitado e higienizado, autor GitHub e criação.
- A API lista comentários públicos e aceita `POST` apenas com sessão válida. Há rate limit por usuário e validação de tamanho.
- O badge começa como sinal visual; contagem de não lidos só será criada quando houver estado de leitura persistente.

## Configuração necessária

Criar um OAuth App do GitHub com callback `https://<dominio>/api/auth/callback/github`. Em Vercel, configurar `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET` e a conexão do banco.

## Qualidade

Cobrir fluxo de estado deslogado/logado, bloqueio do POST anônimo, validação de mensagens e renderização dos avatares. Testar teclado, foco ao abrir/fechar janelas e responsividade do dock.
