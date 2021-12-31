#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { list, add, remove, edit, view } from "./commands.js";

yargs(hideBin(process.argv))
  .scriptName("todo")
  .command("list", "view & check todo list", () => {
    list();
  })
  .command("view", "view the todo list", () => {
    view();
  })
  .command(
    "add [task]",
    "add a new task",
    (yargs) => {
      yargs.positional("task", {
        type: "string",
        describe: "task to do",
      });
    },
    (yargs) => {
      add(yargs.task);
    }
  )
  .command("remove", "remove a task", () => {
    remove();
  })
  .command("edit", "edit a task", () => {
    edit();
  })
  .demandCommand()
  .help().argv;

