/**
 * Vérifie si une entité est située à une limite de mot valide
 * @param index Position de début de l'entité dans le texte
 * @param text Texte complet
 * @param word Mot/entité à vérifier
 * @returns true si l'entité est à une limite de mot valide
 */
export const isValidEntityBoundary = (
  index: number,
  text: string,
  word: string
): boolean => {
  const before = index === 0 || /\s/.test(text[index - 1]);
  const after =
    index + word.length === text.length || /\s/.test(text[index + word.length]);
  return before && after;
};
