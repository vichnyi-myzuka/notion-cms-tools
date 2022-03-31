import { getPageContent, getPages } from '../index.js';
import { parsePage, parsePageContent } from '../parser/index.js';
import { getLoader } from '../image-loader/aws/index.js';
function getFilter() {
  return {
    property: 'Status',
    select: {
      equals: 'Published',
    },
  };
}

async function test() {
  const data = await getPages(getFilter());
  const options = { imageLoader: await getLoader() };
  console.log('Data is loaded');
  const parsedPages = await parsePage(
    data,
    {
      properties: [
        'Title',
        'Date',
        'Topics',
        'Where',
        'Cost',
        'Head Image',
        'Applying link',
        'Status',
      ],
    },
    options
  );
  const pageContent = await getPageContent(parsedPages[0].id);
  const parsedPageContent = await parsePageContent(pageContent, options);
  console.log(parsedPageContent);
}

test();
