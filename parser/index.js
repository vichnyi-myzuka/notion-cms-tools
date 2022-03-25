import { getImagesMap } from '../image-loader/index.js';
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
      parsedPropertyContent = await parseFilesProperty(
        property,
        options.imagesMap
      );
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

const parsePageProps = async function (row, imagesMap) {
  const { properties } = row;
  const parsedProperties = {};
  const propertiesKeys = Object.keys(properties);

  for (const key of propertiesKeys) {
    const parsedProperty = await parsePropertyObject(key, properties[key], {
      imagesMap,
    });
    parsedProperties[processTitle(key)] = parsedProperty;
  }

  return {
    id: row.id,
    properties: parsedProperties,
  };
};

const parseData = async function (data, scheme = null) {
  const imagesMap = await getImagesMap();
  console.log('Images map is loaded.', imagesMap);

  const parsed = await Promise.all(
    data.results.map((row) => parsePageProps(row, imagesMap))
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

const parseBlock = function (block) {
  const { type } = block;

  switch (type) {
    case 'paragraph':
      return parseParagraphBlock(block);
    case 'heading_1':
      return parseHeadingBlock(block);
    case 'heading_2':
      return parseHeadingBlock(block);
    case 'heading_3':
      return parseHeadingBlock(block);
    case 'image':
      return parseImageBlock(block);
    case 'video':
      return parseVideoBlock(block);
    case 'bulleted_list_item':
      return parseListBlock(block);
    default:
      return {
        type: 'undefined',
        content: [],
      };
  }
};

const parsePage = function (page) {
  const { results } = page;

  return results
    .map((block) => parseBlock(block))
    .filter((block) => block.content.length !== 0); // TODO: thinks about <br> for writers
};

export {
  parsePropertyObject,
  parseData,
  parsePageProps,
  parseBlock,
  parsePage,
};
