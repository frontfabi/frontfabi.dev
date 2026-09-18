# frontfabi.dev (portfolio novo / CV)

Site pessoal em Next.js App Router, com Prismic como headless CMS e hospedagem na Vercel. A interface segue as referências fornecidas: desktop retrô, Silkscreen/VT323, paleta creme/teal/âmbar, ícones Pixel e janelas móveis.

## Desenvolvimento

Requer Node.js 24.x (também definido em `engines.node` e `.nvmrc`) e npm. O projeto utiliza somente `package-lock.json` para instalações reproduzíveis; na Vercel, mantenha o Node 24.x e o comando de instalação `npm ci`.

```sh
nvm use
npm ci
npm run dev
```

O Next.js abre na porta 3000 e o Slice Machine na 9999. Para iniciar somente o site: `npm run next:dev`. Variáveis opcionais estão em `.env.example`; mantenha as variáveis existentes da Vercel. Não há novo serviço de hospedagem.

```sh
npm run lint
npx tsc --noEmit
node --experimental-strip-types --test tests/desktop.test.mjs
npm run build
```

## Rotas e idiomas

- `/`: configuração inicial com Sobre e Contato abertas. Clicar em **frontfabi** fecha as demais janelas e restaura essa disposição.
- `/sobre`, `/blog`, `/trabalho`: aplicativos com navegação real, renderizada no servidor.
- `/articles/:uid`: publicação do blog; mantém o formato público dos links antigos.
- `/trabalho/profissional/:uid` e `/trabalho/comunidade/:uid`: cada experiência tem página própria.
- `/xp` redireciona permanentemente para `/trabalho`.
- `/en/...` e `/es/...`: mesmas rotas em inglês e espanhol; português usa a raiz.
- Outras páginas Prismic continuam disponíveis por UID. `/home` redireciona para `/`.

Os menus File, Edit, View, Window e Help abrem opções funcionais. As janelas têm foco visual por sobreposição, fechamento, movimento pela barra de título, redimensionamento pelo canto inferior direito e maximização. A janela principal também pode ser minimizada e restaurada no dock. Setas movem a janela com foco na barra; Shift + setas redimensiona. O movimento permanece dentro da área utilizável. No celular, os aplicativos usam a tela inteira; na home, Sobre e Contato aparecem empilhadas.

## Prismic: sincronização necessária

Os modelos locais são aditivos: nenhum documento existente ou campo antigo foi removido. **É necessário sincronizar as alterações pelo Slice Machine antes de preencher os novos campos.** Esta implementação não publica documentos nem altera idiomas no painel remoto.

1. Abra `npm run slicemachine`, autentique no repositório `frontfabi` e sincronize os modelos.
2. `page`: passa a aceitar a slice `rich_text` e o campo `home_intro`. Use os UIDs `home` e `sobre`; páginas `blog` e `trabalho` são opcionais para metadados. A introdução da home vem de `home_intro`; enquanto estiver vazia, há um texto introdutório curto no código. As slices antigas de experiências da home não são exibidas no desktop inicial.
3. `post`: novo tipo para o blog, com título, resumo, data, categoria, corpo, capa e metadados. Preserve os UIDs dos posts antigos ao importar, para manter os links `/articles/:uid`.
4. `experience`: reutiliza `company`, `jobTitle`, `startDate`, `endDate`, `description`, `logo` e `tools`. Cada documento aparece em **Experiência profissional**.
5. `community`: reutiliza os campos existentes e acrescenta `description`. Cada documento aparece em **Comunidade & palestras**. O tipo de contribuição (palestra, workshop, curso, organização/liderança, mentoria) permanece separado da categoria principal.
6. O repositório consultado possui `pt-br` e `en-us`. Os documentos publicados encontrados estão em `en-us`, alguns com texto em português. Revise essa classificação no Prismic e crie as traduções vinculadas; não há cópia automática de um idioma para outro.
7. Adicione `es-es` no Prismic para habilitar espanhol. Conteúdo de outro idioma não é apresentado como se fosse uma tradução. Em detalhes de posts/experiências, o seletor só oferece traduções vinculadas em `alternate_languages`.
8. Salve os modelos no Slice Machine para regenerar `prismicio-types.d.ts`. Enquanto isso, `src/lib/content-types.ts` tipa os campos aditivos como opcionais para compatibilidade com documentos antigos.

O tipo `post` só entra no route resolver quando existe no repositório remoto; assim o site continua compilando antes da sincronização. Listas vazias e páginas ainda não publicadas mostram um estado explícito, sem conteúdo fictício. Contato e link do CV atuais ficam em `src/components/Desktop/index.tsx`.

## SEO, previews e publicação

Metadados, canonical, `hreflang` de traduções vinculadas, JSON-LD de artigos, `robots.txt` e sitemap são gerados a partir do conteúdo. Páginas vazias ficam como `noindex`; URLs desconhecidas retornam 404. Os dados do CMS são renderizados no servidor, mesmo dentro das janelas interativas.

Configure no Prismic o preview em `/api/preview` e mantenha o webhook de publicação em `/api/revalidate`. O cliente usa a tag `prismic` para invalidar o conteúdo em cache. A rota existente de revalidação foi preservada.

A Vercel continua usando `npm run build`. Se a integração atual aponta para `main`, um push nessa branch dispara o deploy. Primeiro valide em uma branch/Preview Deployment, revise idiomas e importe os posts antigos antes de trocar o site público. Não foi adicionado deploy por outra plataforma.

A integração com dev.to não foi ativada: o Prismic permanece a fonte editorial. Uma futura distribuição deve preservar o canonical de cada artigo no frontfabi.dev.

## Assets

Fontes locais Silkscreen e VT323, distribuídas sob SIL Open Font License; licenças em `public/fonts`. Ícones Streamline Pixel, CC BY 4.0; licença e origem em `public/icons/LICENSE.md`, com crédito na janela de ajuda. As imagens de referência orientaram o layout; não foram incorporadas como screenshots do site.

## Escala dos títulos

Os títulos usam a fonte Born2bSporty FS existente e a escala Major Third (1,250), com base de 1rem (16px por padrão): h1 48,83px, h2 39,06px, h3 31,25px, h4 25px, h5 20px e h6 16px. Os tokens `--heading-h1` a `--heading-h6` ficam em `src/theme/global.css`. A escala se mantém no celular; os títulos podem quebrar linhas. O corpo em VT323 e os tamanhos dos controles do desktop permanecem independentes.
