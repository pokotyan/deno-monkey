import * as lexer from "../lexer/index.ts";
import * as parser from "../parser/index.ts";
import * as ev from "../evaluator/index.ts";
import * as env from "../object/environment.ts";
import { genParserErrors } from "../util/index.ts";

const PROMPT = ">> ";

export const start = async () => {
  const environment = env.NewEnvironment();

  while (true) {
    const buf = new Uint8Array(1024);
    await Deno.stdout.write(new TextEncoder().encode(PROMPT));
    const n = await Deno.stdin.read(buf);
    const input = new TextDecoder().decode(buf.subarray(0, n as number));

    const l = lexer.New(input);
    const p = parser.New(l);
    const program = p.ParseProgram();

    if (p.errors.length) {
      const errors = genParserErrors(p.errors);
      console.log(errors);
      continue;
    }
    const evaluated = ev.Eval(program, environment);

    if (evaluated) {
      console.log(evaluated.Inspect());
    }
  }
};
