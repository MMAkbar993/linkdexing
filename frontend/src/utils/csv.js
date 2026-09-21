// Reads a CSV (or plain .txt) file of URLs into a clean array.
//
// Deliberately simple: these files are one URL per line, or a single column
// of URLs, sometimes with a header row. Anything that doesn't look like a
// URL is dropped rather than silently submitted, so a stray header or a
// blank trailing line can't turn into a wasted credit.

export const URL_LIKE = /^(https?:\/\/|www\.)\S+$/i;

export function parseUrlsFromText(text) {
  const cells = String(text)
    .split(/\r?\n/)
    // Take the first column of each row - covers both bare URL lists and
    // single-column CSV exports with a trailing comma.
    .map((line) => line.split(",")[0])
    .map((cell) => cell.trim().replace(/^"|"$/g, "").trim())
    .filter(Boolean);

  const urls = cells.filter((cell) => URL_LIKE.test(cell));
  const skipped = cells.length - urls.length;

  // De-duplicate while preserving order.
  const unique = [...new Set(urls)];

  return {
    urls: unique,
    skipped,
    duplicates: urls.length - unique.length,
  };
}

export function readCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(parseUrlsFromText(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsText(file);
  });
}
