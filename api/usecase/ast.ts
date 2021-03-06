import * as lexer from "../../lexer/index.ts";
import * as parser from "../../parser/index.ts";
import { genParserErrors } from "../../util/index.ts";

export const ast = (input: string) => {
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();

  if (p.errors.length) {
    const errors = genParserErrors(p.errors);
    return errors;
  }

  return program;
};
