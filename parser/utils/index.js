const findProperty = function (properties, title) {
  return properties.find((property) => property.title === title);
};

const findProperties = function (properties, titles) {
  return properties.filter((property) => titles.includes(property.title));
};

const findBlock = function (blocks, type) {
  return blocks.find((block) => block.type === type);
};

const processTitle = function (title) {
  return title
    .split(' ')
    .map((el) => el.toLowerCase())
    .join('_');
};

export { findProperty, findProperties, findBlock, processTitle };
