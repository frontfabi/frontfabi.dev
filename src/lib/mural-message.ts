export type PublicMuralMessage = {
  id: string;
  body: string;
  login: string;
  avatarUrl: string;
  createdAt: string;
};

export type StoredMuralMessage = PublicMuralMessage & {
  githubId: string;
};

export function publicMessage({ githubId: _githubId, ...message }: StoredMuralMessage) {
  return message;
}
