import * as token from "../token/index.ts";
import * as lexer from "../lexer/index.ts";
import * as ast from "../ast/index.ts";
import * as util from "../util/index.ts";

enum priority {
  LOWEST,
  EQUALS, // ==
  LESSGREATER, // > or <
  SUM, // +
  PRODUCT, // *
  PREFIX, // -X or !X
  CALL, // myFunction(X)
  INDEX, // array[index]
}

// 優先順位。下に行くほど優先順位高。
const precedences = {
  [token.EQ]: priority.EQUALS,
  [token.NOT_EQ]: priority.EQUALS,
  [token.LT]: priority.LESSGREATER,
  [token.GT]: priority.LESSGREATER,
  [token.PLUS]: priority.SUM,
  [token.MINUS]: priority.SUM,
  [token.SLASH]: priority.PRODUCT,
  [token.ASTERISK]: priority.PRODUCT,
  [token.LPAREN]: priority.CALL,
  [token.LBRACKET]: priority.INDEX,
} as any;

export class Parser {
  l: lexer.Lexer;
  errors: string[];
  curToken: token.Token;
  peekToken: token.Token;

  constructor(lexer: lexer.Lexer) {
    this.l = lexer;
    this.errors = [];
    this.curToken = null as unknown as token.Token;
    this.peekToken = null as unknown as token.Token;
  }

  getPrefixParseFn(tokenType: token.TokenType) {
    const prefixParseFns: {
      [k in keyof token.PREFIX_TOKEN]: (p: Parser) => ast.Expression;
    } = {
      [token.IDENT]: parseIdentifier,
      [token.INT]: parseIntegerLiteral,
      [token.BANG as any]: parsePrefixExpression,
      [token.MINUS as any]: parsePrefixExpression,
      [token.TRUE as any]: parseBoolean,
      [token.FALSE as any]: parseBoolean,
      [token.LPAREN as any]: parseGroupedExpression,
      [token.IF as any]: parseIfExpression,
      [token.FUNCTION as any]: parseFunctionLiteral,
    } as {
      [k in keyof token.PREFIX_TOKEN]: (p: Parser) => ast.Expression;
    };

    return util.getProp(prefixParseFns, tokenType as any);
  }

  getInfixParseFn(tokenType: token.TokenType) {
    const infixParseFns: {
      [k in keyof token.INFIX_TOKEN]: any;
    } = {
      [token.PLUS as any]: parseInfixExpression,
      [token.MINUS as any]: parseInfixExpression,
      [token.SLASH as any]: parseInfixExpression,
      [token.ASTERISK as any]: parseInfixExpression,
      [token.EQ as any]: parseInfixExpression,
      [token.NOT_EQ as any]: parseInfixExpression,
      [token.LT as any]: parseInfixExpression,
      [token.GT as any]: parseInfixExpression,
      [token.LPAREN as any]: parseCallExpression,
    } as {
      [k in keyof token.INFIX_TOKEN]: any;
    };

    return util.getProp(infixParseFns, tokenType as any);
  }

  curTokenIs(tokenType: token.TokenType): boolean {
    return this.curToken.Type === tokenType;
  }

  peekTokenIs(tokenType: token.TokenType): boolean {
    return this.peekToken.Type === tokenType;
  }

  // 次のトークンの優先順位を確認。なければ最低の優先順位をデフォで返す。
  peekPrecedence(): number {
    if (this.peekToken.Type in precedences) {
      return precedences[this.peekToken.Type];
    }

    return priority.LOWEST;
  }

  // 現在のトークンの優先順位を確認。なければ最低の優先順位をデフォで返す。
  curPrecedence(): number {
    if (this.curToken.Type in precedences) {
      return precedences[this.curToken.Type];
    }

    return priority.LOWEST;
  }

  expectPeek(tokenType: token.TokenType): boolean {
    if (this.peekTokenIs(tokenType)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(tokenType);
      return false;
    }
  }

  peekError(tokenType: token.TokenType) {
    const msg =
      `expected next token to be ${tokenType}, got ${this.peekToken.Type} instead`;
    this.errors.push(msg);
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.nextToken();
  }

  ParseProgram(): ast.Program {
    const program = new ast.Program();

    while (this.curToken.Type != token.EOF) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.Statements.push(stmt);
      }
      this.nextToken();
    }
    return program;
  }

  parseStatement() {
    switch (this.curToken.Type) {
      case token.LET:
        return this.parseLetStatement();
      case token.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }
  // let <identifier> = <expression>;
  parseLetStatement(): ast.LetStatement | null {
    const stmt = new ast.LetStatement(this.curToken);
    if (!this.expectPeek(token.IDENT)) {
      return null;
    }

    stmt.Name = new ast.Identifier(
      { token: this.curToken, value: this.curToken.Literal },
    );

    if (!this.expectPeek(token.ASSIGN)) {
      return null;
    }
    this.nextToken();

    stmt.Value = this.parseExpression(priority.LOWEST) as ast.Expression;

    // 次が ; だったら
    if (this.peekTokenIs(token.SEMICOLON)) {
      // ; にトークンを移動する。（末尾が;じゃなくてもエラーにはしない）
      this.nextToken();
    }

    return stmt;
  }

  // return <expression>;
  parseReturnStatement(): ast.ReturnStatement {
    const stmt = new ast.ReturnStatement(this.curToken);

    this.nextToken();

    stmt.ReturnValue = this.parseExpression(priority.LOWEST) as ast.Expression;

    while (!this.curTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseExpressionStatement(): ast.ExpressionStatement {
    const stmt = new ast.ExpressionStatement(this.curToken);

    stmt.Expression = this.parseExpression(priority.LOWEST) as ast.Expression;

    if (this.peekTokenIs(token.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  parseExpression(priority: number): ast.Expression | null {
    const prefix = this.getPrefixParseFn(this.curToken.Type);

    if (!prefix) {
      noPrefixParseFnError(this, this.curToken.Type);
      return null;
    }
    let leftExp = prefix(this);

    while (
      !this.peekTokenIs(token.SEMICOLON) && priority < this.peekPrecedence()
    ) {
      const infix = this.getInfixParseFn(this.peekToken.Type) as
        | typeof parseInfixExpression
        | undefined;

      if (!infix) {
        return leftExp;
      }
      this.nextToken();

      leftExp = infix(this, leftExp);
    }

    return leftExp;
  }
}

export const New = (lexer: lexer.Lexer): Parser => {
  const p = new Parser(lexer);

  // Read two tokens, so curToken and peekToken are both set
  p.nextToken();
  p.nextToken();

  return p;
};

const parseIdentifier = (p: Parser): ast.Expression => {
  return new ast.Identifier({ token: p.curToken, value: p.curToken.Literal });
};

const parseIntegerLiteral = (p: Parser): ast.Expression => {
  const literal = new ast.IntegerLiteral(p.curToken);
  const value = parseInt(p.curToken.Literal, 10);

  if (typeof value === undefined) {
    p.errors.push(`could not parse ${p.curToken.Literal} as integer`);
    return null as unknown as ast.Expression;
  }

  literal.Value = value;
  return literal;
};

const parsePrefixExpression = (p: Parser): ast.Expression => {
  const exp = new ast.PrefixExpression(
    { token: p.curToken, operator: p.curToken.Literal },
  );

  p.nextToken();

  exp.Right = p.parseExpression(priority.PREFIX) as ast.Expression;
  return exp;
};

const parseInfixExpression = (
  p: Parser,
  left: ast.Expression,
): ast.Expression => {
  const exp = new ast.InfixExpression(
    { token: p.curToken, operator: p.curToken.Literal, left },
  );
  const precedence = p.curPrecedence();
  p.nextToken();
  exp.Right = p.parseExpression(precedence) as ast.Expression;

  return exp;
};

const parseBoolean = (p: Parser): ast.Expression => {
  return new ast.Boolean(
    { token: p.curToken, value: p.curTokenIs(token.TRUE) },
  );
};

const parseGroupedExpression = (p: Parser): ast.Expression | null => {
  p.nextToken();

  const exp = p.parseExpression(priority.LOWEST) as ast.Expression;

  if (!p.expectPeek(token.RPAREN)) {
    return null;
  }

  return exp;
};

const parseBlockStatement = (p: Parser): ast.BlockStatement => {
  const block = new ast.BlockStatement(p.curToken);

  p.nextToken();

  while (!p.curTokenIs(token.RBRACE) && !p.curTokenIs(token.EOF)) {
    const stmt = p.parseStatement();

    if (stmt != null) {
      block.Statements.push(stmt);
    }
    p.nextToken();
  }

  return block;
};

const parseIfExpression = (p: Parser): ast.Expression | null => {
  const exp = new ast.IfExpression(p.curToken);

  if (!p.expectPeek(token.LPAREN)) {
    return null;
  }

  p.nextToken();

  exp.Condition = p.parseExpression(priority.LOWEST) as ast.Expression;

  if (!p.expectPeek(token.RPAREN)) {
    return null;
  }

  if (!p.expectPeek(token.LBRACE)) {
    return null;
  }

  exp.Consequence = parseBlockStatement(p);

  if (p.peekTokenIs(token.ELSE)) {
    p.nextToken();

    if (!p.expectPeek(token.LBRACE)) {
      return null;
    }

    exp.Alternative = parseBlockStatement(p);
  }

  return exp;
};

const parseFunctionParameters = (p: Parser): ast.Identifier[] | null => {
  const identifiers = [] as ast.Identifier[];

  if (p.peekTokenIs(token.RPAREN)) {
    p.nextToken();
    return identifiers;
  }

  p.nextToken();

  const ident = new ast.Identifier(
    { token: p.curToken, value: p.curToken.Literal },
  );
  identifiers.push(ident);

  while (p.peekTokenIs(token.COMMA)) {
    p.nextToken();
    p.nextToken();
    const ident = new ast.Identifier(
      { token: p.curToken, value: p.curToken.Literal },
    );
    identifiers.push(ident);
  }

  if (!p.expectPeek(token.RPAREN)) {
    return null;
  }
  return identifiers;
};

// fn <parameters> <block statement>
const parseFunctionLiteral = (p: Parser): ast.Expression | null => {
  const lit = new ast.FunctionLiteral(p.curToken);

  if (!p.expectPeek(token.LPAREN)) {
    return null;
  }

  lit.Parameters = parseFunctionParameters(p) as ast.Identifier[];

  if (!p.expectPeek(token.LBRACE)) {
    return null;
  }

  lit.Body = parseBlockStatement(p);

  return lit;
};

const parseExpressionList = (
  { p, end }: { p: Parser; end: token.TokenType },
): ast.Expression[] | null => {
  const list = [] as ast.Expression[];
  if (p.peekTokenIs(end)) {
    p.nextToken();
    return list;
  }

  p.nextToken();
  list.push(p.parseExpression(priority.LOWEST) as ast.Expression);

  while (p.peekTokenIs(token.COMMA)) {
    p.nextToken();
    p.nextToken();
    list.push(p.parseExpression(priority.LOWEST) as ast.Expression);
  }

  if (!p.expectPeek(end)) {
    return null;
  }
  return list;
};

const parseCallExpression = (
  p: Parser,
  func: ast.Expression,
): ast.Expression => {
  const exp = new ast.CallExpression({ token: p.curToken, func });
  exp.Arguments = parseExpressionList(
    { p, end: token.RPAREN },
  ) as ast.Expression[];

  return exp;
};

const noPrefixParseFnError = (p: Parser, tokenType: token.TokenType) => {
  p.errors.push(`no prefix parse function for ${tokenType} found`);
};
