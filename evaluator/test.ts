import * as assert from "https://deno.land/std/testing/asserts.ts";
import * as lexer from "../lexer/index.ts";
import * as parser from "../parser/index.ts";
import * as ev from "./index.ts";
import * as obj from "../object/index.ts";

const testIntegerObject = <T extends obj.Integer>(
  { obj, expected }: { obj: T; expected: number },
) => {
  assert.assertEquals(obj.Value, expected);
};

const testBooleanObject = <T extends obj.Bool>(
  { obj, expected }: { obj: T; expected: boolean },
) => {
  assert.assertEquals(obj.Value, expected);
};

const testEvalIntegerExpression = () => {
  const tests = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
    { input: "-5", expected: -5 },
    { input: "-10", expected: -10 },
    // { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
    // { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
    // { input: "-50 + 100 + -50", expected: 0 },
    // { input: "5 * 2 + 10", expected: 20 },
    // { input: "5 + 2 * 10", expected: 25 },
    // { input: "20 + 2 * -10", expected: 0 },
    // { input: "50 / 2 * 2 + 10", expected: 60 },
    // { input: "2 * (5 + 10)", expected: 30 },
    // { input: "3 * 3 * 3 + 10", expected: 37 },
    // { input: "3 * (3 * 3) + 10", expected: 37 },
    // { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: evaluated, expected: test.expected });
  }
};

const testEvalBooleanExpression = () => {
  const tests = [
    { input: "true", expected: true },
    { input: "false", expected: false },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input) as obj.Bool;

    testBooleanObject({ obj: evaluated, expected: test.expected });
  }
};

const testBangOperator = () => {
  const tests = [
    { input: "!true", expected: false },
    { input: "!false", expected: true },
    { input: "!5", expected: false },
    { input: "!!true", expected: true },
    { input: "!!false", expected: false },
    { input: "!!5", expected: true },
    { input: "!!-5", expected: true },
    { input: "!0", expected: false },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input) as obj.Bool;

    testBooleanObject({ obj: evaluated, expected: test.expected });
  }
};

const testEval = (input: string): obj.Object => {
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();

  return ev.Eval(program);
};

testEvalIntegerExpression();
testEvalBooleanExpression();
testBangOperator();
