import { Client } from '@notionhq/client';

const client = new Client({
  auth: process.env.NOTION_SECRET,
});

const getAll = async (filter) => {
  return client.databases.query({
    database_id: process.env.DATABASE_ID,
    filter,
  });
};

const getOne = async (id) => {
  return client.pages.retrieve({
    page_id: id,
  });
};

const getBlock = async (id) => {
  return client.blocks.children.list({
    block_id: id,
  });
};

const changeProperty = async (page_id, properties) => {
  return client.pages.update({
    page_id,
    properties,
  });
};

export { getOne, getAll, getBlock, changeProperty };
