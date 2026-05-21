export function prettifyKitabSlug(slug: string) {
  return slug
    .split("_")
    .map((part) =>
      part === "ibnu"
        ? "Ibnu"
        : part === "shahih"
          ? "Shahih"
          : part === "sunan"
            ? "Sunan"
            : part === "musnad"
              ? "Musnad"
              : part === "riyadhus"
                ? "Riyadhus"
                : part === "shalihin"
                  ? "Shalihin"
                  : part === "majah"
                    ? "Majah"
                    : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  laquo: "«",
  raquo: "»",
  hellip: "…",
  mdash: "—",
  ndash: "–",
};

function decodeEntities(input: string) {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const code = parseInt(body.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (body.startsWith("#")) {
      const code = parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named ?? match;
  });
}

/**
 * Convert raw upstream hadits markup ("<br>", `\r`, HTML entities, stray
 * whitespace) into clean plain text with `\n` line breaks. Pair it with a
 * `whitespace-pre-line` className to preserve paragraphs in the UI.
 */
export function cleanHaditsText(input: string | null | undefined): string {
  if (!input) return "";
  let text = input;
  // Normalize line break tags first.
  text = text.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  text = text.replace(/<\s*\/?\s*p\s*>/gi, "\n\n");
  text = text.replace(/<\s*\/?\s*div\s*>/gi, "\n");
  // Strip any other HTML tags.
  text = text.replace(/<[^>]+>/g, "");
  // Decode entities like &amp;, &nbsp;, &#39;, &#x202b;
  text = decodeEntities(text);
  // Normalize line endings and zero-width control chars.
  text = text.replace(/\r\n?/g, "\n");
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
  // Collapse 3+ blank lines and trim trailing spaces per line.
  text = text
    .split("\n")
    .map((line) => line.replace(/[\t ]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}
