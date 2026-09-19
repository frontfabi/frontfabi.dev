type SqlQuery = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => PromiseLike<{ id: string }[]>;

export async function deleteMessageForActor(
  database: SqlQuery,
  { id, githubId }: { id: string; githubId: string },
) {
  const rows = await database`
    DELETE FROM mural_messages
    WHERE id = ${id} AND github_id = ${githubId}
    RETURNING id
  `;
  return rows.length > 0;
}
