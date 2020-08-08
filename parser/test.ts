import * as lexer from "../lexer/index.ts";
import * as parser from "./index.ts";
import * as ast from "../ast/index.ts";
import * as assert from "https://deno.land/std/testing/asserts.ts";

const checkParserErrors = (parser: parser.Parser) => {
  if (!parser.errors.length) {
    return;
  }

  let msg = `parser has ${parser.errors.length} errors\n`;

  for (const e of parser.errors) {
    msg = msg += `parser error: ${e}\n`;
  }

  assert.fail(msg);
};

const testLetStatement = (
  { stmt, name }: { stmt: ast.LetStatement; name: string },
) => {
  assert.assertEquals(stmt.Name.Value, name);
  assert.assertEquals(stmt.Name.TokenLiteral(), name);
};

const testLetStatements = () => {
  const tests = [
    { input: "let x = 5;", expectedIdentifier: "x", expectedValue: 5 },
    { input: "let y = true;", expectedIdentifier: "y", expectedValue: true },
    {
      input: "let foobar = y;",
      expectedIdentifier: "foobar",
      expectedValue: "y",
    },
    { input: "let y = true", expectedIdentifier: "y", expectedValue: true },
  ];

  for (const test of tests) {
    const l = lexer.New(test.input);
    const p = parser.New(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    assert.assertEquals(program.Statements.length, 1);

    const stmt = program.Statements[0] as ast.LetStatement;
    testLetStatement(
      {
        stmt,
        name: test.expectedIdentifier,
      },
    );

    const letStmt = stmt as ast.LetStatement;

    testLiteralExpression({ exp: letStmt.Value, expected: test.expectedValue });
  }
};

const testIntegerLiteral = (
  { il, value }: { il: ast.Expression; value: number },
) => {
  const inteq = il as ast.IntegerLiteral;

  assert.assertEquals(inteq.Value, value);
  assert.assertEquals(inteq.TokenLiteral(), `${value}`);
};

const testIdentifier = (
  { exp, value }: { exp: ast.Expression; value: string },
) => {
  const ident = exp as ast.Identifier;
  assert.assertEquals(ident.Value, value);
  assert.assertEquals(ident.TokenLiteral(), `${value}`);
};

const testBooleanLiteral = (
  { exp, value }: { exp: ast.Expression; value: boolean },
) => {
  const bool = exp as ast.Boolean;

  assert.assertEquals(bool.Value, value);

  assert.assertEquals(bool.TokenLiteral(), `${value}`);

  return true;
};

const testLiteralExpression = (
  { exp, expected }: { exp: ast.Expression; expected: any },
) => {
  switch (typeof expected) {
    case "number":
      return testIntegerLiteral({ il: exp, value: expected });
    case "string":
      return testIdentifier({ exp, value: expected });
    case "boolean":
      return testBooleanLiteral({ exp, value: expected });
    default:
      assert.fail(`type of exp not handled. got=${exp}`);
  }
};

const testReturnStatements = () => {
  const tests = [
    { input: "return 5;", expectedValue: 5 },
    { input: "return foobar;", expectedValue: "foobar" },
  ];
  for (const test of tests) {
    const l = lexer.New(test.input);
    const p = parser.New(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    assert.assertEquals(program.Statements.length, 1);

    const stmt = program.Statements[0] as ast.ReturnStatement;
    assert.assertEquals(stmt.TokenLiteral(), "return");

    testLiteralExpression(
      { exp: stmt.ReturnValue, expected: test.expectedValue },
    );
  }
};

const testIdentifierExpression = () => {
  const input = "foobar;";
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  checkParserErrors(p);

  assert.assertEquals(program.Statements.length, 1);

  const stmt = program.Statements[0] as ast.ExpressionStatement;
  const ident = stmt.Expression as ast.Identifier;

  assert.assertEquals(ident.Value, "foobar");
  assert.assertEquals(ident.TokenLiteral(), "foobar");
};

const testIntegerLiteralExpression = () => {
  const input = "5;";
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  checkParserErrors(p);

  assert.assertEquals(program.Statements.length, 1);

  const stmt = program.Statements[0] as ast.ExpressionStatement;
  const literal = stmt.Expression as ast.IntegerLiteral;

  assert.assertEquals(literal.Value, 5);
  assert.assertEquals(literal.TokenLiteral(), "5");
};

const testParsingPrefixExpressions = () => {
  const tests = [
    { input: "!5;", operator: "!", value: 5 },
    { input: "-15;", operator: "-", value: 15 },
    { input: "!foobar;", operator: "!", value: "foobar" },
    { input: "-foobar;", operator: "-", value: "foobar" },
    { input: "!true;", operator: "!", value: true },
    { input: "!false;", operator: "!", value: false },
  ];

  for (const test of tests) {
    const l = lexer.New(test.input);
    const p = parser.New(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    assert.assertEquals(program.Statements.length, 1);

    const stmt = program.Statements[0] as ast.ExpressionStatement;
    const exp = stmt.Expression as ast.PrefixExpression;

    assert.assertEquals(exp.Operator, test.operator);
    testLiteralExpression({ exp: exp.Right, expected: test.value });
  }
};

const testInfixExpression = (
  { exp, left, operator, right }: {
    exp: ast.Expression;
    left: any;
    operator: string;
    right: any;
  },
) => {
  const opExp = exp as ast.InfixExpression;

  testLiteralExpression({ exp: opExp.Left, expected: left });
  assert.assertEquals(opExp.Operator, operator);
  testLiteralExpression({ exp: opExp.Right, expected: right });
};

const testParsingInfixExpressions = () => {
  const tests = [
    { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
    { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
    { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
    { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
    { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
    { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
    { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
    { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
    {
      input: "foobar + barfoo;",
      leftValue: "foobar",
      operator: "+",
      rightValue: "barfoo",
    },
    {
      input: "foobar - barfoo;",
      leftValue: "foobar",
      operator: "-",
      rightValue: "barfoo",
    },
    {
      input: "foobar * barfoo;",
      leftValue: "foobar",
      operator: "*",
      rightValue: "barfoo",
    },
    {
      input: "foobar / barfoo;",
      leftValue: "foobar",
      operator: "/",
      rightValue: "barfoo",
    },
    {
      input: "foobar > barfoo;",
      leftValue: "foobar",
      operator: ">",
      rightValue: "barfoo",
    },
    {
      input: "foobar < barfoo;",
      leftValue: "foobar",
      operator: "<",
      rightValue: "barfoo",
    },
    {
      input: "foobar == barfoo;",
      leftValue: "foobar",
      operator: "==",
      rightValue: "barfoo",
    },
    {
      input: "foobar != barfoo;",
      leftValue: "foobar",
      operator: "!=",
      rightValue: "barfoo",
    },
    {
      input: "true == true",
      leftValue: true,
      operator: "==",
      rightValue: true,
    },
    {
      input: "true != false",
      leftValue: true,
      operator: "!=",
      rightValue: false,
    },
    {
      input: "false == false",
      leftValue: false,
      operator: "==",
      rightValue: false,
    },
  ];

  for (const test of tests) {
    const l = lexer.New(test.input);
    const p = parser.New(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    assert.assertEquals(program.Statements.length, 1);

    const stmt = program.Statements[0] as ast.ExpressionStatement;

    testInfixExpression({
      exp: stmt.Expression,
      left: test.leftValue,
      operator: test.operator,
      right: test.rightValue,
    });
  }
};

const testOperatorPrecedenceParsing = () => {
  const tests = [
    {
      input: "-a * b",
      expected: "((-a) * b)",
    },
    {
      input: "!-a",
      expected: "(!(-a))",
    },
    {
      input: "a + b + c",
      expected: "((a + b) + c)",
    },
    {
      input: "a + b - c",
      expected: "((a + b) - c)",
    },
    {
      input: "a * b * c",
      expected: "((a * b) * c)",
    },
    {
      input: "a * b / c",
      expected: "((a * b) / c)",
    },
    {
      input: "a + b / c",
      expected: "(a + (b / c))",
    },
    {
      input: "a + b * c + d / e - f",
      expected: "(((a + (b * c)) + (d / e)) - f)",
    },
    {
      input: "3 + 4; -5 * 5",
      expected: "(3 + 4)((-5) * 5)",
    },
    {
      input: "5 > 4 == 3 < 4",
      expected: "((5 > 4) == (3 < 4))",
    },
    {
      input: "5 < 4 != 3 > 4",
      expected: "((5 < 4) != (3 > 4))",
    },
    {
      input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
      expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
    },
    {
      input: "true",
      expected: "true",
    },
    {
      input: "false",
      expected: "false",
    },
    {
      input: "3 > 5 == false",
      expected: "((3 > 5) == false)",
    },
    {
      input: "3 < 5 == true",
      expected: "((3 < 5) == true)",
    },
    {
      input: "1 + (2 + 3) + 4",
      expected: "((1 + (2 + 3)) + 4)",
    },
    {
      input: "(5 + 5) * 2",
      expected: "((5 + 5) * 2)",
    },
    {
      input: "2 / (5 + 5)",
      expected: "(2 / (5 + 5))",
    },
    {
      input: "(5 + 5) * 2 * (5 + 5)",
      expected: "(((5 + 5) * 2) * (5 + 5))",
    },
    {
      input: "-(5 + 5)",
      expected: "(-(5 + 5))",
    },
    {
      input: "!(true == true)",
      expected: "(!(true == true))",
    },
    {
      input: "a + hoge() + d",
      expected: "((a + hoge()) + d)",
    },
    {
      input: "a + add(b * c) + d",
      expected: "((a + add((b * c))) + d)",
    },
    {
      input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
      expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
    },
    {
      input: "add(a + b + c * d / f + g)",
      expected: "add((((a + b) + ((c * d) / f)) + g))",
    },
  ];

  for (const test of tests) {
    const l = lexer.New(test.input);
    const p = parser.New(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    const actual = program.String();

    assert.assertEquals(actual, test.expected);
  }
};

// if (<condition>) <consequence>
const testIfExpression = () => {
  const input = `if (x < y) { x }`;
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  checkParserErrors(p);

  assert.assertEquals(program.Statements.length, 1);

  const stmt = program.Statements[0] as ast.ExpressionStatement;

  const exp = stmt.Expression as ast.IfExpression;

  testInfixExpression(
    { exp: exp.Condition, left: "x", operator: "<", right: "y" },
  );

  assert.assertEquals(exp.Consequence.Statements.length, 1);

  const consequence = exp.Consequence.Statements[0] as ast.ExpressionStatement;

  testIdentifier({ exp: consequence.Expression, value: "x" });

  assert.assertEquals(exp.Alternative, null);
};

// if (<condition>) <consequence> else <alternative>
const testIfElseExpression = () => {
  const input = `if (x < y) { x } else { y }`;
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  checkParserErrors(p);

  assert.assertEquals(program.Statements.length, 1);

  const stmt = program.Statements[0] as ast.ExpressionStatement;

  const exp = stmt.Expression as ast.IfExpression;

  testInfixExpression(
    { exp: exp.Condition, left: "x", operator: "<", right: "y" },
  );

  assert.assertEquals(exp.Consequence.Statements.length, 1);

  const consequence = exp.Consequence.Statements[0] as ast.ExpressionStatement;

  testIdentifier({ exp: consequence.Expression, value: "x" });

  assert.assertEquals(exp.Alternative.Statements.length, 1);

  const alternative = exp.Alternative.Statements[0] as ast.ExpressionStatement;

  testIdentifier({ exp: alternative.Expression, value: "y" });
};

const testFunctionLiteralParsing = () => {
  const input = `fn(x, y) { x + y; }`;

  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  checkParserErrors(p);

  assert.assertEquals(program.Statements.length, 1);

  const stmt = program.Statements[0] as ast.ExpressionStatement;
  const func = stmt.Expression as ast.FunctionLiteral;

  assert.assertEquals(func.Parameters.length, 2);

  testLiteralExpression({ exp: func.Parameters[0], expected: "x" });
  testLiteralExpression({ exp: func.Parameters[1], expected: "y" });

  assert.assertEquals(func.Body.Statements.length, 1);

  const body = func.Body.Statements[0] as ast.ExpressionStatement;
  testInfixExpression(
    { exp: body.Expression, left: "x", operator: "+", right: "y" },
  );
};

const testFunctionParameterParsing = () => {
  const tests = [
    {
      input: "fn() {};",
      expectedParams: [],
    },
    {
      input: "fn(x) {};",
      expectedParams: ["x"],
    },
    {
      input: "fn(x, y, z) {};",
      expectedParams: ["x", "y", "z"],
    },
  ];

  for (const test of tests) {
    const l = lexer.New(test.input);
    const p = parser.New(l);
    const program = p.ParseProgram();
    checkParserErrors(p);

    const stmt = program.Statements[0] as ast.ExpressionStatement;
    const func = stmt.Expression as ast.FunctionLiteral;

    assert.assertEquals(func.Parameters.length, test.expectedParams.length);

    test.expectedParams.forEach((ident, i) => {
      testLiteralExpression({ exp: func.Parameters[i], expected: ident });
    });
  }
};

const testCallExpressionParsing = () => {
  const input = "add(1, 2 * 3, 4 + 5);";
  const l = lexer.New(input);
  const p = parser.New(l);
  const program = p.ParseProgram();
  checkParserErrors(p);

  assert.assertEquals(program.Statements.length, 1);

  const stmt = program.Statements[0] as ast.ExpressionStatement;

  const exp = stmt.Expression as ast.CallExpression;

  testIdentifier({ exp: exp.Function, value: "add" });

  assert.assertEquals(exp.Arguments.length, 3);

  testLiteralExpression({ exp: exp.Arguments[0], expected: 1 });
  testInfixExpression(
    { exp: exp.Arguments[1], left: 2, operator: "*", right: 3 },
  );
  testInfixExpression(
    { exp: exp.Arguments[2], left: 4, operator: "+", right: 5 },
  );
};

testLetStatements();
// testReturnStatements();
// testIdentifierExpression();
// testIntegerLiteralExpression();
// testParsingPrefixExpressions();
// testParsingInfixExpressions();
// testOperatorPrecedenceParsing();
// testIfExpression();
// testIfElseExpression();
// testFunctionLiteralParsing();
// testFunctionParameterParsing();
// testCallExpressionParsing();
