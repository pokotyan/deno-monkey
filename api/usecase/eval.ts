import * as lexer from "../../lexer/index.ts";
import * as parser from "../../parser/index.ts";
import * as ev from "../../evaluator/index.ts";
import * as env from "../../object/environment.ts";
import { genParserErrors } from "../../util/index.ts";

export const evaluator = (input: string) => {
  const environment = env.NewEnvironment();
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();

  if (p.errors.length) {
    const errors = genParserErrors(p.errors);
    return errors;
  }
  const evaluated = ev.Eval(program, environment);

  if (evaluated) {
    return evaluated.Inspect();
  }

  return "";
};
