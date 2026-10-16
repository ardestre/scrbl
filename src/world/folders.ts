import type { Creation, CreationKind } from './types';

/** Which folder is open in My Art: everything, the automatic folder for one kind, or a kid-made folder. */
export type Selection = { type: 'all' } | { type: 'kind'; kind: CreationKind } | { type: 'folder'; id: string };

export function filterCreations(creations: Creation[], sel: Selection): Creation[] {
  if (sel.type === 'all') return creations;
  if (sel.type === 'kind') return creations.filter((c) => c.kind === sel.kind);
  return creations.filter((c) => c.folderId === sel.id);
}
