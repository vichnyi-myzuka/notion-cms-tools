import { Client } from '@notionhq/client';

const client = new Client({
  auth: process.env.NOTION_SECRET,
});

const getPages = async (filter) => {
  return client.databases.query({
    database_id: process.env.DATABASE_ID,
    filter,
  });
};

const getPage = async (id) => {
  return client.pages.retrieve({
    page_id: id,
  });
};

const getPageContent = async (id) => {
  return client.blocks.children.list({
    block_id: id,
  });
};

const updatePageProperty = async (page_id, properties) => {
  return client.pages.update({
    page_id,
    properties,
  });
};

export { getPage, getPages, getPageContent, updatePageProperty };
