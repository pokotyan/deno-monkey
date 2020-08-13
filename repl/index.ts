import * as lexer from "../lexer/index.ts";
import * as parser from "../parser/index.ts";
import * as ev from "../evaluator/index.ts";
import * as env from "../object/environment.ts";

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
      printParserErrors(p.errors);
      continue;
    }
    const evaluated = ev.Eval(program, environment);

    if (evaluated) {
      console.log(evaluated.Inspect());
    }
  }
};

const MONKEY_FACE = `
            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
 \\ '- ,\\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '-----'
`;

const printParserErrors = (errors: string[]) => {
  console.log(MONKEY_FACE);
  console.log("Woops! We ran into some monkey business here!");
  console.log("parser errors:");

  errors.forEach((err) => {
    console.log(err);
  });
};
