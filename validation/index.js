import { processTitle } from '../parser/utils/index.js';

function arrayEquals(a, b) {
  const aSorted = a.sort();
  const bSorted = b.sort();

  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    aSorted.every((val, index) => val === bSorted[index])
  );
}

export function validate(data, scheme) {
  function validatePage(page) {
    const { properties } = page;
    const processedTitles = Object.keys(properties);
    const titles = processedTitles.map((key) => properties[key].title);

    const titlesEqual = arrayEquals(scheme.properties, titles);
    const processedTitlesEqual = arrayEquals(
      scheme.properties.map((title) => processTitle(title)),
      processedTitles
    );

    return titlesEqual && processedTitlesEqual;
  }
  const validated = data.map((page) => validatePage(page));

  return validated.reduce((prev, next) => prev && next, true);
}
