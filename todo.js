#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { list } from "./commands.js";

yargs(hideBin(process.argv))
  .scriptName("todo")
  .command("list", "view todo list", () => {
    list();
  })
  .command(
    "add [task]",
    "add a new task",
    (yargs) => {
      yargs.positional("task", {
        type: "string",
        default: "new task",
        describe: "task to do",
      });
    },
    (yargs) => {
      console.log("add: ", yargs.task);
    }
  )
  .command("remove", "remove a task", () => {
    console.log("remove");
  })
  .command("edit", "edit a task", () => {
    console.log("edit");
  })
  .demandCommand()
  .help().argv;

