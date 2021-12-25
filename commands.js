import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });
const blockId = process.env.NOTION_TODO;

export async function list() {
  const response = await notion.blocks.retrieve({
    block_id: blockId,
  });
  console.log(response);
}

