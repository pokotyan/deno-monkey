import * as lexer from "./index.ts";
import * as token from "../token/index.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const testNextToken = () => {
  const input = `let five = 5;
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    };

    let result = add(five, ten);
    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
        return true;
    } else {
        return false;
    }

    10 == 10;
    10 != 9;
    "foobar"
    "foo_bar"
    [1, 2];
    {"foo": "bar"}
    `;

  const tests = [
    { expectedType: token.LET, expectedLiteral: "let" },
    { expectedType: token.IDENT, expectedLiteral: "five" },
    { expectedType: token.ASSIGN, expectedLiteral: "=" },
    { expectedType: token.INT, expectedLiteral: "5" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.LET, expectedLiteral: "let" },
    { expectedType: token.IDENT, expectedLiteral: "ten" },
    { expectedType: token.ASSIGN, expectedLiteral: "=" },
    { expectedType: token.INT, expectedLiteral: "10" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.LET, expectedLiteral: "let" },
    { expectedType: token.IDENT, expectedLiteral: "add" },
    { expectedType: token.ASSIGN, expectedLiteral: "=" },
    { expectedType: token.FUNCTION, expectedLiteral: "fn" },
    { expectedType: token.LPAREN, expectedLiteral: "(" },
    { expectedType: token.IDENT, expectedLiteral: "x" },
    { expectedType: token.COMMA, expectedLiteral: "," },
    { expectedType: token.IDENT, expectedLiteral: "y" },
    { expectedType: token.RPAREN, expectedLiteral: ")" },
    { expectedType: token.LBRACE, expectedLiteral: "{" },
    { expectedType: token.IDENT, expectedLiteral: "x" },
    { expectedType: token.PLUS, expectedLiteral: "+" },
    { expectedType: token.IDENT, expectedLiteral: "y" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.RBRACE, expectedLiteral: "}" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.LET, expectedLiteral: "let" },
    { expectedType: token.IDENT, expectedLiteral: "result" },
    { expectedType: token.ASSIGN, expectedLiteral: "=" },
    { expectedType: token.IDENT, expectedLiteral: "add" },
    { expectedType: token.LPAREN, expectedLiteral: "(" },
    { expectedType: token.IDENT, expectedLiteral: "five" },
    { expectedType: token.COMMA, expectedLiteral: "," },
    { expectedType: token.IDENT, expectedLiteral: "ten" },
    { expectedType: token.RPAREN, expectedLiteral: ")" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.BANG, expectedLiteral: "!" },
    { expectedType: token.MINUS, expectedLiteral: "-" },
    { expectedType: token.SLASH, expectedLiteral: "/" },
    { expectedType: token.ASTERISK, expectedLiteral: "*" },
    { expectedType: token.INT, expectedLiteral: "5" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.INT, expectedLiteral: "5" },
    { expectedType: token.LT, expectedLiteral: "<" },
    { expectedType: token.INT, expectedLiteral: "10" },
    { expectedType: token.GT, expectedLiteral: ">" },
    { expectedType: token.INT, expectedLiteral: "5" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.IF, expectedLiteral: "if" },
    { expectedType: token.LPAREN, expectedLiteral: "(" },
    { expectedType: token.INT, expectedLiteral: "5" },
    { expectedType: token.LT, expectedLiteral: "<" },
    { expectedType: token.INT, expectedLiteral: "10" },
    { expectedType: token.RPAREN, expectedLiteral: ")" },
    { expectedType: token.LBRACE, expectedLiteral: "{" },
    { expectedType: token.RETURN, expectedLiteral: "return" },
    { expectedType: token.TRUE, expectedLiteral: "true" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.RBRACE, expectedLiteral: "}" },
    { expectedType: token.ELSE, expectedLiteral: "else" },
    { expectedType: token.LBRACE, expectedLiteral: "{" },
    { expectedType: token.RETURN, expectedLiteral: "return" },
    { expectedType: token.FALSE, expectedLiteral: "false" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.RBRACE, expectedLiteral: "}" },
    { expectedType: token.INT, expectedLiteral: "10" },
    { expectedType: token.EQ, expectedLiteral: "==" },
    { expectedType: token.INT, expectedLiteral: "10" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.INT, expectedLiteral: "10" },
    { expectedType: token.NOT_EQ, expectedLiteral: "!=" },
    { expectedType: token.INT, expectedLiteral: "9" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.STRING, expectedLiteral: "foobar" },
    { expectedType: token.STRING, expectedLiteral: "foo_bar" },
    { expectedType: token.LBRACKET, expectedLiteral: "[" },
    { expectedType: token.INT, expectedLiteral: "1" },
    { expectedType: token.COMMA, expectedLiteral: "," },
    { expectedType: token.INT, expectedLiteral: "2" },
    { expectedType: token.RBRACKET, expectedLiteral: "]" },
    { expectedType: token.SEMICOLON, expectedLiteral: ";" },
    { expectedType: token.LBRACE, expectedLiteral: "{" },
    { expectedType: token.STRING, expectedLiteral: "foo" },
    { expectedType: token.COLON, expectedLiteral: ":" },
    { expectedType: token.STRING, expectedLiteral: "bar" },
    { expectedType: token.RBRACE, expectedLiteral: "}" },
    { expectedType: token.EOF, expectedLiteral: "" },
  ];

  const l = lexer.New(input);

  for (const test of tests) {
    const tok = l.nextToken();

    assertEquals(tok.Type, test.expectedType);
    assertEquals(tok.Literal, test.expectedLiteral);
  }
};

testNextToken();
