import { parse } from "https://deno.land/std/flags/mod.ts";

const args = parse(Deno.args);
if (!args.mode) {
  throw "Can't find the argument `mode`, please specify `mode`";
}

if (args.mode === "repl") {
  import("./repl/index.ts");
} else if (args.mode === "api") {
  import("./api/index.ts");
} else {
  throw `mode can be "api" or "repl" got: ${args.mode}`;
}
