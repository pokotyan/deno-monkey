import { parse } from "https://deno.land/std/flags/mod.ts";

const args = parse(Deno.args);
if (!args.mode) {
  throw "Can't find the argument `mode`, please specify `mode`";
}

const isValidMode = ["repl", "api"].includes(args.mode);

if (!isValidMode) {
  throw `mode can be "api" or "repl" got: ${args.mode}`;
}

if (args.mode === "repl") {
  import("./entry_point/repl.ts");
} else {
  import("./entry_point/api.ts");
}
