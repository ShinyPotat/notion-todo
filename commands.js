import { Client } from "@notionhq/client";
import inquirer from "inquirer";
import lodash from "lodash";
import dotenv from "dotenv";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: __dirname + '/.env'});

const notion = new Client({ auth: process.env.NOTION_KEY });
const pageId = process.env.NOTION_PAGE;

const [title, emoji] = await notion.pages
  .retrieve({ page_id: pageId })
  .then((response) => {
    const title =
      response.properties.title.title.length === 0
        ? "To-Do"
        : response.properties.title.title[0].plain_text;
    const emoji = response.icon === null ? "✔️" : response.icon.emoji;

    return new Promise(function (resolve, reject) {
      resolve([title, emoji]);
    });
  });

const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });
const page = response.results;

export function view() {
  console.log();
  Object.entries(
    page.filter((block) => {
      return block.type === "to_do";
    })
  ).forEach(([index, block]) => {
    const index_print = Number(index) + 1;
    const emoji_print = block.to_do.checked
      ? "\x1b[36m ✓ \x1b[0m"
      : "\x1b[31m ✕ \x1b[0m";
    const name_print = block.to_do.text[0].plain_text;
    console.log("	".concat(index_print, " |", emoji_print, name_print));
  });
}

export async function list() {
  var todos = [];
  var _default = [];
  Object.entries(
    page.filter((block) => {
      return block.type === "to_do";
    })
  ).forEach(([index, block]) => {
    todos.push({
      blockId: block.id,
      value: index,
      name: block.to_do.text[0].plain_text,
    });
    if (block.to_do.checked) _default.push(index);
  });

  const checked = await inquirer.prompt([
    {
      type: "checkbox",
      name: "todo",
      message: title.concat(" ",emoji),
      choices: todos,
      default: _default,
    },
  ]);

  const changed = lodash.xor(_default, checked.todo);

  for (const index of changed) {
    const todo = todos[index];
    await notion.blocks.update({
      block_id: todo.blockId,
      to_do: {
        checked: checked.todo.includes(index),
      },
    });
  }
}

export async function add(task) {
  if (task === undefined) {
    const new_task = await inquirer.prompt([
      {
        type: "editor",
        name: "editor",
        message: "Write New Task",
      },
    ]);
    task = new_task.editor.trim();
    console.log(task);
  }

  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: "block",
        type: "to_do",
        to_do: {
          text: [
            {
              type: "text",
              text: {
                content: task,
                link: null,
              },
            },
          ],
        },
      },
    ],
  });
}

export async function remove() {
  const [index, todo] = await select_todo();
  const sure = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure?",
    },
  ]);
  if (sure.confirm) {
    await notion.blocks.delete({
      block_id: todo.blockId,
    });
  }
}

export async function edit() {
  const [index, todo_to_edit] = await select_todo();
  const edited_todo = await inquirer.prompt([
    {
      type: "editor",
      name: "editor",
      message: "Editing " + todo_to_edit.name,
      default: todo_to_edit.name,
    },
  ]);
  await notion.blocks.update({
    block_id: todo_to_edit.blockId,
    to_do: {
      text: [
        {
          type: "text",
          text: {
            content: edited_todo.editor.trim(),
          },
        },
      ],
    },
  });
}

async function select_todo() {
  const todos = page
    .filter((block) => {
      return block.type === "to_do";
    })
    .map((block) => {
      return {
        name: block.to_do.text[0].plain_text,
        blockId: block.id,
      };
    });

  const todo_input = await inquirer.prompt([
    {
      type: "list",
      name: "list",
      message: "Select task",
      choices: todos,
    },
  ]);
  const index = todos.map(({ name }) => name).indexOf(todo_input.list);

  return new Promise(function (resolve, reject) {
    resolve([index, todos[index]]);
  });
}

