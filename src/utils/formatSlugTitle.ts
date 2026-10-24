/** "engineering-entrance" -> "Engineering Entrance". Used for category-style
 * slugs (multi-word). Faculty slugs (IOE, CSIT, BCA...) are acronyms and are
 * deliberately kept uppercase elsewhere rather than run through this. */
export function formatSlugTitle(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
