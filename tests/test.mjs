import { getAll } from '../index.js';
import { parseData } from '../parser/index.js';
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
  const data = await getAll(getFilter());
  console.log('Data is loaded');
  const parsedData = await parseData(
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
