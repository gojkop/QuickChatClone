export const DEFAULT_AVATAR_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234f46e5;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%237c3aed;stop-opacity:1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='100' fill='url(%23gradient)'/%3E%3Ccircle cx='100' cy='70' r='28' fill='white' opacity='0.95'/%3E%3Cellipse cx='100' cy='155' rx='45' ry='55' fill='white' opacity='0.95'/%3E%3Crect x='0' y='145' width='200' height='55' fill='url(%23gradient)'/%3E%3C/svg%3E`;

export function getDefaultAvatar() {
  return DEFAULT_AVATAR_SVG;
}