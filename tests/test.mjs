import { getPages } from '../index.js';
import { parsePage } from '../parser/index.js';
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
  console.log('Data is loaded');
  const parsedData = await parsePage(
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
    { imageLoader: await getLoader() }
  );
}

test();
