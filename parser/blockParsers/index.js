const parseInline = function (object) {
  return {
    text: object.text.content,
    annotations: {
      bold: object.annotations.bold,
      italic: object.annotations.italic,
      code: object.annotations.code,
    },
    href: object.text.link?.url ?? '',
  };
};

const parseParagraphBlock = function (block) {
  const { rich_text } = block.paragraph;

  return {
    text: rich_text.map((paragraph) => parseInline(paragraph)),
  };
};

const parseHeadingBlock = function (block) {
  const { rich_text } = block.heading_1 ?? block.heading_2 ?? block.heading_3;

  return {
    text: rich_text.map((heading) => parseInline(heading)),
  };
};

const parseImageBlock = async function (block, options) {
  let url = block.image.file?.url || block.image.external?.url || null;
  let webp = '';
  if (url && options.imageLoader) {
    const {
      imageLoader: { map, loader },
    } = options;

    const result = await loader(url, map);
    url = result.url;
    webp = result.webp;
  }

  return {
    url,
    webp,
  };

  return {
    url: block.image.file.url,
  };
};

const parseVideoBlock = function (block) {
  return {
    url: block.video.external.url,
  };
};

const parseListBlock = function (block) {
  const { bulleted_list_item } = block;
  console.log(block);
  return {
    list: bulleted_list_item.rich_text.map((item) => parseInline(item)),
  };
};

export {
  parseParagraphBlock,
  parseInline,
  parseHeadingBlock,
  parseImageBlock,
  parseVideoBlock,
  parseListBlock,
};
