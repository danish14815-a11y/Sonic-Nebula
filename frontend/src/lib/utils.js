import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Safely decode HTML entities (e.g. ``&quot;``, ``&amp;``, ``&#39;``) from
 * upstream JioSaavn responses without rendering any markup. Previously the
 * app passed these strings through ``dangerouslySetInnerHTML`` to get entity
 * decoding, which also executed any HTML/JS the upstream returned (stored
 * XSS surface via a third-party API). Using a detached ``textarea`` lets the
 * browser decode entities while still returning plain text we can render
 * with standard JSX interpolation.
 */
export function decodeHtmlEntities(input) {
  if (input == null) return '';
  const str = String(input);
  if (typeof document === 'undefined') {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}
