import { prepareImage } from '../../image-loader/index.js';

const parseTitleProperty = function (property) {
  const title = property.title;

  return {
    text: title[0].plain_text,
  };
};

const parseUrlProperty = function (property) {
  return {
    url: property.url,
  };
};

const parseDateProperty = function (property) {
  return {
    date: property.date.start,
  };
};

const parseNumberProperty = function (property) {
  return {
    number: property.number,
  };
};

const parseFilesProperty = async function (property, map) {
  let url =
    property.files[0]?.file?.url || property.files[0]?.external?.url || null;
  let webp = '';
  if (url) {
    const result = await prepareImage(url, map);
    url = result.url;
    webp = result.webp;
  }

  return {
    url,
    webp,
  };
};

const parseRichTextProperty = function (property) {
  const richText = property.rich_text;

  return {
    text: richText[0].plain_text,
  };
};

const parseSelectProperty = function (property) {
  const select = property.select;

  return {
    text: select.name,
  };
};

const parseMultiSelectProperty = function (property) {
  const multiselect = property.multi_select;

  return {
    options: multiselect.map((option) => ({ text: option.name })),
  };
};

const parsePeopleProperty = function (property) {
  const people = property.people;

  return {
    people: people.map((person) => ({ text: person.name })),
  };
};

export {
  parseTitleProperty,
  parseRichTextProperty,
  parseSelectProperty,
  parsePeopleProperty,
  parseMultiSelectProperty,
  parseUrlProperty,
  parseNumberProperty,
  parseDateProperty,
  parseFilesProperty,
};
