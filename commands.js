import { Client } from "@notionhq/client";
import inquirer from "inquirer";
import lodash from "lodash";
import dotenv from "dotenv";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const blockId = process.env.NOTION_TODO;

const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  });
const page = response.results;

export async function list() {
  var todos = [];
  Object.entries(page).forEach(([index, block]) => {
    todos.push({
      blockId: block.id,
      value: index,
      name: block.to_do.text[0].plain_text,
    });
  });

  var _default = [];
  Object.entries(page).forEach(([index, block]) => {
    if (block.to_do.checked) _default.push(index);
  });

  const checked = await inquirer.prompt([
    {
      type: "checkbox",
      name: "todo",
      message: "Mi día ☀️",
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
    block_id: blockId,
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
}

async function select_todo() {
  const todos = page.map((block) => {
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

