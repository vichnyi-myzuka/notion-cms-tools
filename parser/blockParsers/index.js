const parseInline = function (object) {
	return {
		text: object.text.content,
		annotations: {
			bold: object.annotations.bold,
			italic: object.annotations.italic,
			code: object.annotations.code,
		},
		type: object.text.link ? "link" : "inline",
		href: object.text.link?.url ?? "",
	};
};

const parseText = function (object) {
	return {
		text: object.text.content,
		type: "text",
	};
};

const parseParagraphBlock = function (block) {
	const { text } = block.paragraph;
	return {
		type: "paragraph",
		content: text.map((paragraph) => parseInline(paragraph)),
	};
};

const parseHeadingBlock = function (block) {
	const { text } = block.heading_1 ?? block.heading_2 ?? block.heading_3;
	return {
		type: "heading",
		content: text.map((heading) => parseInline(heading)),
	};
};

const parseImageBlock = function (block) {
	return {
		type: "image",
		content: {
			url: block.image.file.url,
		},
	};
};

const parseVideoBlock = function (block) {
	console.log(block);
	return {
		type: "video",
		content: {
			url: block.video.external.url,
		},
	};
};

const parseListBlock = function (block) {
	const { bulleted_list_item } = block;
	return {
		type: "list_item",
		content: bulleted_list_item.text.map((item) => parseInline(item)),
	};
};

export {
	parseParagraphBlock,
	parseInline,
	parseText,
	parseHeadingBlock,
	parseImageBlock,
	parseVideoBlock,
	parseListBlock,
};
