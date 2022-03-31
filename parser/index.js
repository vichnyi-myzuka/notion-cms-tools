import { validate } from '../validation/index.js';
import { processTitle } from './utils/index.js';
import {
  parseMultiSelectProperty,
  parsePeopleProperty,
  parseRichTextProperty,
  parseSelectProperty,
  parseTitleProperty,
  parseUrlProperty,
  parseNumberProperty,
  parseDateProperty,
  parseFilesProperty,
} from './propertyParsers/index.js';
import {
  parseHeadingBlock,
  parseImageBlock,
  parseListBlock,
  parseParagraphBlock,
  parseVideoBlock,
} from './blockParsers/index.js';

const parsePropertyObject = async function (title, property, options) {
  let parsedPropertyContent;
  const { type } = property;
  switch (type) {
    case 'title':
      parsedPropertyContent = parseTitleProperty(property);
      break;
    case 'url':
      parsedPropertyContent = parseUrlProperty(property);
      break;
    case 'number':
      parsedPropertyContent = parseNumberProperty(property);
      break;
    case 'date':
      parsedPropertyContent = parseDateProperty(property);
      break;
    case 'files':
      parsedPropertyContent = await parseFilesProperty(property, options);
      break;
    case 'rich_text':
      parsedPropertyContent = parseRichTextProperty(property);
      break;
    case 'select':
      parsedPropertyContent = parseSelectProperty(property);
      break;
    case 'people':
      parsedPropertyContent = parsePeopleProperty(property);
      break;
    case 'multi_select':
      parsedPropertyContent = parseMultiSelectProperty(property);
      break;
    default:
      parsedPropertyContent = { type: 'undefined' };
      break;
  }

  return {
    title,
    type,
    ...parsedPropertyContent,
  };
};

const parsePageProps = async function (row, options) {
  const { properties } = row;
  const parsedProperties = {};
  const propertiesKeys = Object.keys(properties);

  for (const key of propertiesKeys) {
    const parsedProperty = await parsePropertyObject(
      key,
      properties[key],
      options
    );
    parsedProperties[processTitle(key)] = parsedProperty;
  }

  return {
    id: row.id,
    properties: parsedProperties,
  };
};

const parsePage = async function (data, scheme = null, options = {}) {
  const parsed = await Promise.all(
    data.results.map((row) => parsePageProps(row, options))
  );

  if (scheme) {
    if (!validate(parsed, scheme)) {
      throw Error('Validation is failed! Check your properties with schema!');

      return {};
    }
  }
  console.log('Validated!');

  return parsed;
};

const parsePageBlock = async function (block, options) {
  const { type } = block;
  let parsedBlockContent;

  switch (type) {
    case 'paragraph':
      parsedBlockContent = parseParagraphBlock(block);
      break;
    case 'heading_1':
      parsedBlockContent = parseHeadingBlock(block);
      break;
    case 'heading_2':
      parsedBlockContent = parseHeadingBlock(block);
      break;
    case 'heading_3':
      parsedBlockContent = parseHeadingBlock(block);
      break;
    case 'image':
      parsedBlockContent = await parseImageBlock(block, options);
      break;
    case 'video':
      parsedBlockContent = parseVideoBlock(block);
      break;
    case 'bulleted_list_item':
      parsedBlockContent = parseListBlock(block);
      break;
    default:
      parsedBlockContent = { type: 'undefined' };
      break;
  }
  return {
    type,
    ...parsedBlockContent,
  };
};

const parsePageContent = async function (page, options = {}) {
  const { results } = page;

  const parsed = await Promise.all(
    results.map((row) => parsePageBlock(row, options))
  );

  return parsed; // TODO: thinks about <br> for writers
};

export {
  parsePropertyObject,
  parsePage,
  parsePageProps,
  parsePageBlock,
  parsePageContent,
};
