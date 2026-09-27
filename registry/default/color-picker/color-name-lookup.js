// Suggests human color names ("Wisteria", "Milk Chocolate") for a hex value,
// using the curated "best of" list from https://github.com/meodai/color-names
// (~5,000 names, ~200 KB). The full list (~32,000 names, ~1.2 MB) is only used
// for typed searches, because it has names the curated one lacks ("Rose Gold").
// Both are loaded on demand via dynamic import, each in its own chunk.
//
// "Closest" is measured in OKLab, where distance tracks how different two
// colors look — plain RGB distance picks noticeably worse matches.

function hexToOklab(hex) {
  const lin = (from) => {
    const c = parseInt(hex.slice(from, from + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [lin(1), lin(3), lin(5)];

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const indexPromises = {};

export function loadColorNameIndex(list = "bestof") {
  indexPromises[list] ??= (
    list === "all" ? import("color-name-list") : import("color-name-list/bestof")
  )
    .then(({ colornames }) => {
      const names = [];
      const lowerNames = [];
      const hexes = [];
      const lab = new Float32Array(colornames.length * 3);

      colornames.forEach(({ name, hex }, i) => {
        names.push(name);
        lowerNames.push(name.toLowerCase());
        hexes.push(hex.toLowerCase());
        lab.set(hexToOklab(hex), i * 3);
      });

      return { names, lowerNames, hexes, lab };
    })
    .catch((error) => {
      delete indexPromises[list]; // allow a retry next time
      throw error;
    });

  return indexPromises[list];
}

/** The `count` closest named colors to `hex` ("#rrggbb"), nearest first */
export function suggestColorNames(index, hex, count = 6) {
  const [L, A, B] = hexToOklab(hex);
  const { lab } = index;
  const best = [];

  for (let i = 0, n = lab.length / 3; i < n; i++) {
    const dL = lab[i * 3] - L;
    const dA = lab[i * 3 + 1] - A;
    const dB = lab[i * 3 + 2] - B;
    const d = dL * dL + dA * dA + dB * dB;

    if (best.length < count) best.push({ i, d });
    else if (d < best[count - 1].d) best[count - 1] = { i, d };
    else continue;

    // keep `best` sorted by distance (insertion step)
    for (let j = best.length - 1; j > 0 && best[j - 1].d > best[j].d; j--) {
      [best[j - 1], best[j]] = [best[j], best[j - 1]];
    }
  }

  return best.map(({ i }) => ({
    name: index.names[i],
    hex: index.hexes[i],
    exact: index.hexes[i] === hex.toLowerCase(),
  }));
}

/**
 * Names matching a typed query, best matches first: names starting with the
 * query, then names with a word starting with it, then names containing it.
 * Every word of the query has to appear somewhere in the name (spaces and
 * hyphens are ignored as a fallback, so "sea green" also finds "Seagreen").
 */
export function searchColorNames(index, query, limit = 30) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const phrase = words.join(" ");
  const compact = words.join("");

  const hits = [];
  for (let i = 0; i < index.lowerNames.length; i++) {
    const name = index.lowerNames[i];

    if (!words.every((w) => name.includes(w))) {
      // "sea green" should still find "Seagreen" / "Sea-Green"
      if (name.replace(/[\s-]/g, "").includes(compact)) hits.push({ i, rank: 2 });
      continue;
    }

    const rank = name.startsWith(phrase)
      ? 0
      : name.includes(" " + phrase) || name.includes("-" + phrase)
        ? 1
        : 2;
    hits.push({ i, rank });
  }

  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      index.names[a.i].length - index.names[b.i].length ||
      index.names[a.i].localeCompare(index.names[b.i]),
  );

  return hits.slice(0, limit).map(({ i }) => ({ name: index.names[i], hex: index.hexes[i] }));
}

/** The hex of the color called `name` (case-insensitive), or null if it isn't in the list */
export function findColorHex(index, name) {
  const i = index.lowerNames.indexOf(name.trim().toLowerCase());
  return i === -1 ? null : index.hexes[i];
}
