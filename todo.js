#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { list } from "./commands.js";

const argv = yargs(hideBin(process.argv))
  .scriptName("todo")
  .command("list", "view todo list")
  .command("add [task]", "add a new task", (yargs) => {
    yargs.positional("task", {
      type: "string",
      default: "new task",
      describe: "task to do",
    });
  })
  .command("remove", "remove a task")
  .command("edit", "edit a task")
  .demandCommand()
  .help().argv;

if (argv._.includes("list")) list();
if (argv._.includes("add")) console.log("add: ", argv.task);
if (argv._.includes("remove")) console.log("remove");
if (argv._.includes("edit")) console.log("edit");

