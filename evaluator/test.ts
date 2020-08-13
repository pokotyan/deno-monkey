import * as assert from "https://deno.land/std/testing/asserts.ts";
import * as lexer from "../lexer/index.ts";
import * as parser from "../parser/index.ts";
import * as ev from "./index.ts";
import * as obj from "../object/index.ts";
import * as env from "../object/environment.ts";
import * as ast from "../ast/index.ts";

const testIntegerObject = <T extends obj.Integer>({
  obj,
  expected,
}: {
  obj: T;
  expected: number;
}) => {
  assert.assertEquals(obj.Value, expected);
};

const testBooleanObject = <T extends obj.Bool>({
  obj,
  expected,
}: {
  obj: T;
  expected: boolean;
}) => {
  assert.assertEquals(obj.Value, expected);
};

const testNullObject = <T extends obj.Null>(obj: T) => {
  assert.assertEquals(obj, ev.NULL);
};

const testEvalIntegerExpression = () => {
  const tests = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
    { input: "-5", expected: -5 },
    { input: "-10", expected: -10 },
    { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
    { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
    { input: "-50 + 100 + -50", expected: 0 },
    { input: "5 * 2 + 10", expected: 20 },
    { input: "5 + 2 * 10", expected: 25 },
    { input: "20 + 2 * -10", expected: 0 },
    { input: "50 / 2 * 2 + 10", expected: 60 },
    { input: "2 * (5 + 10)", expected: 30 },
    { input: "3 * 3 * 3 + 10", expected: 37 },
    { input: "3 * (3 * 3) + 10", expected: 37 },
    { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
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
    { input: "1 < 2", expected: true },
    { input: "1 > 2", expected: false },
    { input: "1 < 1", expected: false },
    { input: "1 > 1", expected: false },
    { input: "1 == 1", expected: true },
    { input: "1 != 1", expected: false },
    { input: "1 == 2", expected: false },
    { input: "1 != 2", expected: true },
    { input: "true == true", expected: true },
    { input: "false == false", expected: true },
    { input: "true == false", expected: false },
    { input: "true != false", expected: true },
    { input: "false != true", expected: true },
    { input: "(1 < 2) == true", expected: true },
    { input: "(1 < 2) == false", expected: false },
    { input: "(1 > 2) == true", expected: false },
    { input: "(1 > 2) == false", expected: true },
    { input: "1 == true", expected: false }, // 1はtruthyではあるが、trueではない
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

const testIfElseExpressions = () => {
  const tests1 = [
    { input: "if (true) { 10 }", expected: 10 },
    { input: "if (1) { 10 }", expected: 10 },
    { input: "if (1 < 2) { 10 }", expected: 10 },
    { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
    { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
  ];

  const tests2 = [
    { input: "if (false) { 10 }", expected: null }, // elseのブロックがない場合、NULLを返す設計にする。
    { input: "if (1 > 2) { 10 }", expected: null },
  ];

  for (const test of tests1) {
    const evaluated = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: evaluated, expected: test.expected });
  }
  for (const test of tests2) {
    const evaluated = testEval(test.input) as obj.Null;

    testNullObject(evaluated);
  }
};

const testEval = (input: string): obj.Object => {
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  const environment = env.NewEnvironment();

  return ev.Eval(program, environment);
};

// return文はトップレベルでも使える。関数内じゃないとダメという縛りはない設計。
// return文は右側にある式をただただ返すだけ。
const testReturnStatements = () => {
  const tests = [
    { input: "return 10;", expected: 10 },
    { input: "return 10; 9;", expected: 10 },
    { input: "return 2 * 5; 9;", expected: 10 },
    { input: "9; return 2 * 5; 9;", expected: 10 },
    {
      input: `
    if (10 > 1) {
      if (10 > 1) {
        return 10;
      }

      return 1;
    }
    `,
      expected: 10,
    },
  ];

  for (const test of tests) {
    const evaluated = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: evaluated, expected: test.expected });
  }
};

const testErrorHandling = () => {
  const tests = [
    {
      input: "5 + true;",
      expectedMessage: "type mismatch: INTEGER + BOOLEAN",
    },
    {
      input: "5 + true; 5;",
      expectedMessage: "type mismatch: INTEGER + BOOLEAN",
    },
    {
      input: "-true",
      expectedMessage: "unknown operator: -BOOLEAN",
    },
    {
      input: "true + false;",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "true + false + true + false;",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "5; true + false; 5",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "if (10 > 1) { true + false; }",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: `
    if (10 > 1) {
     if (10 > 1) {
       return true + false;
     }

     return 1;
    }
    `,
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "foobar",
      expectedMessage: "identifier not found: foobar",
    },
  ];

  for (const test of tests) {
    const errObj = testEval(test.input) as obj.Error;

    assert.assertEquals(errObj.Message, test.expectedMessage);
  }
};

const testLetStatements = () => {
  const tests = [
    { input: "let a = 5; a;", expected: 5 },
    { input: "let a = 5 * 5; a;", expected: 25 },
    { input: "let a = 5; let b = a; b;", expected: 5 },
    { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
  ];

  for (const test of tests) {
    const intObj = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: intObj, expected: test.expected });
  }
};

const testFunctionObject = () => {
  const input = "fn(x) { x + 2; };";

  const fn = testEval(input) as obj.Function;

  assert.assertEquals(fn.Parameters.length, 1);
  assert.assertEquals(fn.Parameters[0].String(), "x");
  assert.assertEquals(fn.Body.String(), "(x + 2)");
};

const testFunctionApplication = () => {
  const tests = [
    { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 }, // returnはなくてもいい
    { input: "let identity = fn(x) { return x; }; identity(5);", expected: 5 }, // returnはあってもいい
    { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
    { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
    {
      input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
      expected: 20,
    }, // パラメータに式が使える
    { input: "fn(x) { x; }(5)", expected: 5 }, // 即時関数もできる
  ];

  for (const test of tests) {
    const intObj = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: intObj, expected: test.expected });
  }
};

const testClosures = () => {
  const input = `
  let newAdder = fn(x) {
    fn(y) { x + y };
  };

  let addTwo = newAdder(2);
  addTwo(2);`;

  const intObj = testEval(input) as obj.Integer;

  testIntegerObject({ obj: intObj, expected: 4 });
};

const testStringLiteral = () => {
  const input = `"Hello World!"`;

  const str = testEval(input) as obj.String;

  assert.assertEquals(str.Value, "Hello World!");
};

const testStringConcatenation = () => {
  const input = `"Hello" + " " + "World!"`;
  const str = testEval(input) as obj.String;

  assert.assertEquals(str.Value, "Hello World!");
};

const testBuiltinFunctionOfLen = () => {
  const tests1 = [
    { input: `len("")`, expected: 0 },
    { input: `len("four")`, expected: 4 },
    { input: `len("hello world")`, expected: 11 },
    { input: `len([1, 2, 3])`, expected: 3 },
    { input: `len([])`, expected: 0 },
  ];

  const tests2 = [
    {
      input: `len(1)`,
      expected: 'argument to "len" not supported, got INTEGER',
    },
    {
      input: `len("one", "two")`,
      expected: "wrong number of arguments. got=2, want=1",
    },
  ];

  for (const test of tests1) {
    const obj = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: obj, expected: test.expected });
  }

  for (const test of tests2) {
    const obj = testEval(test.input) as obj.Error;

    assert.assertEquals(obj.Message, test.expected);
  }
};

const testArrayLiterals = () => {
  const input = "[1, 2 * 2, 3 + 3]";

  const arr = testEval(input) as obj.Array;

  assert.assertEquals(arr.Elements.length, 3);
  testIntegerObject({ obj: arr.Elements[0] as obj.Integer, expected: 1 });
  testIntegerObject({ obj: arr.Elements[1] as obj.Integer, expected: 4 });
  testIntegerObject({ obj: arr.Elements[2] as obj.Integer, expected: 6 });
};

const testArrayIndexExpressions = () => {
  const tests1 = [
    {
      input: "[1, 2, 3][0]",
      expected: 1,
    },
    {
      input: "[1, 2, 3][1]",
      expected: 2,
    },
    {
      input: "[1, 2, 3][2]",
      expected: 3,
    },
    {
      input: "let i = 0; [1][i];",
      expected: 1,
    },
    {
      input: "[1, 2, 3][1 + 1];",
      expected: 3,
    },
    {
      input: "let myArray = [1, 2, 3]; myArray[2];",
      expected: 3,
    },
    {
      input: "let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];",
      expected: 6,
    },
    {
      input: "let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]",
      expected: 2,
    },
  ];

  const tests2 = [
    {
      input: "[1, 2, 3][3]", // 存在しない添字アクセスはNULLを返す設計
      expected: null,
    },
    {
      input: "[1, 2, 3][-1]", // 存在しない添字アクセスはNULLを返す設計
      expected: null,
    },
  ];

  for (const test of tests1) {
    const int = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: int, expected: test.expected });
  }

  for (const test of tests2) {
    const nil = testEval(test.input) as obj.Null;

    testNullObject(nil);
  }
};

const testHashLiterals = () => {
  const input = `
  {
  	"one": 10 - 9,
  	"two": 1 + 1,
  	4: 4,
  	true: 5,
  	false: 6
  }`;
  const result = testEval(input) as obj.Hash;
  const expected: {
    [k: string]: number;
  } = {
    one: 1,
    two: 2,
    "4": 4,
    true: 5,
    false: 6,
  };

  assert.assertEquals(
    Object.keys(result.Pairs).length,
    Object.keys(expected).length
  );

  Object.keys(expected).forEach((expectedkey) => {
    const expectedvalue = expected[expectedkey];
    const pair = result.Pairs[expectedkey];

    testIntegerObject({
      obj: pair.Value as obj.Integer,
      expected: expectedvalue,
    });
  });
};

const testHashIndexExpressions = () => {
  const tests1 = [
    {
      input: `{"foo": 5}["foo"]`,
      expected: 5,
    },
    {
      input: `let key = "foo"; {"foo": 5}[key]`,
      expected: 5,
    },
    {
      input: `{5: 5}[5]`,
      expected: 5,
    },
    {
      input: `{true: 5}[true]`,
      expected: 5,
    },
    {
      input: `{false: 5}[false]`,
      expected: 5,
    },
  ];

  const tests2 = [
    {
      input: `{"foo": 5}["bar"]`,
      expected: null,
    },
    {
      input: `{}["foo"]`,
      expected: null,
    },
  ];

  for (const test of tests1) {
    const int = testEval(test.input) as obj.Integer;

    testIntegerObject({ obj: int, expected: test.expected });
  }

  for (const test of tests2) {
    const nil = testEval(test.input) as obj.Null;

    testNullObject(nil);
  }
};

testEvalIntegerExpression();
testEvalBooleanExpression();
testBangOperator();
testIfElseExpressions();
testReturnStatements();
testErrorHandling();
testLetStatements();
testFunctionObject();
testFunctionApplication();
testClosures();
testStringLiteral();
testStringConcatenation();
testBuiltinFunctionOfLen();
testArrayLiterals();
testArrayIndexExpressions();
testHashLiterals();
testHashIndexExpressions();
