import * as token from "../token/index.ts";

export interface Node {
  TokenLiteral(): string;
  String(): void;
}

export interface Statement extends Node {
  statementNode(): any;
}

export interface Expression extends Node {
  expressionNode(): any;
}

export class Program {
  Statements: Statement[];

  constructor() {
    this.Statements = [];
  }

  tokenLiteral() {
    if (this.Statements.length) {
      return this.Statements[0].TokenLiteral();
    } else {
      return "";
    }
  }

  String() {
    let str = "";
    for (const s of this.Statements) {
      str += s.String();
    }
    return str;
  }
}

// -------------------
// Statements
// -------------------
export class LetStatement implements Statement {
  Token: token.Token;
  Name: Identifier;
  Value: Expression;

  constructor(token: token.Token) {
    this.Token = token;
    this.Name = "" as any;
    this.Value = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  statementNode() {}

  String() {
    let str = `${this.TokenLiteral()} ${this.Name.String()} = `;

    if (this.Value) {
      // Expression
      str += this.Value.String();
    }

    str += ";";

    return str;
  }
}

export class ReturnStatement implements Statement {
  Token: token.Token;
  ReturnValue: Expression;

  constructor(token: token.Token) {
    this.Token = token;
    this.ReturnValue = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  statementNode() {}

  String() {
    let str = `${this.TokenLiteral()} `;

    if (this.ReturnValue) {
      // Expression
      str += this.ReturnValue.String();
    }

    str += ";";

    return str;
  }
}

export class ExpressionStatement implements Statement {
  Token: token.Token;
  Expression: Expression;

  constructor(token: token.Token) {
    this.Token = token;
    this.Expression = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  statementNode() {}

  String() {
    if (this.Expression) {
      return this.Expression.String();
    }
    return "";
  }
}

// -------------------
// Expressions
// -------------------
export class Identifier implements Expression {
  Token: token.Token;
  Value: string;

  constructor({ token, value }: { token: token.Token; value: string }) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    return this.Value;
  }
}

export class IntegerLiteral implements Expression {
  Token: token.Token;
  Value: number;

  constructor(token: token.Token) {
    this.Token = token;
    this.Value = 0;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    return this.Token.Literal;
  }
}

export class PrefixExpression implements Expression {
  Token: token.Token;
  Operator: string;
  Right: Expression;

  constructor({ token, operator }: { token: token.Token; operator: string }) {
    this.Token = token;
    this.Operator = operator;
    this.Right = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    const str = `(${this.Operator}${this.Right.String()})`;
    return str;
  }
}

export class InfixExpression implements Expression {
  Token: token.Token;
  Left: Expression;
  Operator: string;
  Right: Expression;

  constructor(
    { token, operator, left }: {
      token: token.Token;
      operator: string;
      left: Expression;
    },
  ) {
    this.Token = token;
    this.Operator = operator;
    this.Left = left;
    this.Right = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    const str =
      `(${this.Left.String()} ${this.Operator} ${this.Right.String()})`;
    return str;
  }
}

export class Boolean implements Expression {
  Token: token.Token;
  Value: boolean;

  constructor(
    { token, value }: {
      token: token.Token;
      value: boolean;
    },
  ) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    return this.Token.Literal;
  }
}

export class BlockStatement implements Expression {
  Token: token.Token;
  Statements: Statement[];

  constructor(token: token.Token) {
    this.Token = token;
    this.Statements = [];
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let str = "";
    for (const stmt of this.Statements) {
      str += stmt.String();
    }
    return str;
  }
}

// if (<condition>) <consequence> else <alternative>
export class IfExpression implements Expression {
  Token: token.Token;
  Condition: Expression;
  Consequence: BlockStatement;
  Alternative: BlockStatement;

  constructor(token: token.Token) {
    this.Token = token;
    this.Condition = null as any;
    this.Consequence = null as any;
    this.Alternative = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let str = `if${this.Condition.String()} ${this.Consequence.String()}`;

    if (this.Alternative) {
      str += `else ${this.Alternative.String()}`;
    }

    return str;
  }
}

// fn <parameters> <block statement>
export class FunctionLiteral implements Expression {
  Token: token.Token;
  Parameters: Identifier[];
  Body: BlockStatement;

  constructor(token: token.Token) {
    this.Token = token;
    this.Parameters = [];
    this.Body = null as any;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let params = "";
    for (const param of this.Parameters) {
      params += `${param.String()}, `;
    }

    let str = `${this.TokenLiteral()}(${params}) ${this.Body.String()}`;

    return str;
  }
}

// <expression>()
// <expression>(<expression>)
// <expression>(<expression>, <expression>, <expression>, ...)
export class CallExpression implements Expression {
  Token: token.Token; // The '(' token
  Function: Expression; // Identifier or FunctionLiteral
  Arguments: Expression[];

  constructor({ token, func }: { token: token.Token; func: Expression }) {
    this.Token = token;
    this.Function = func;
    this.Arguments = [];
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let args = "";
    console.log(this);

    this.Arguments.forEach((arg, i) => {
      const lastIndex = Math.max(this.Arguments.length - 1, 0);
      if (i === lastIndex) {
        args += `${arg.String()}`;
      } else {
        args += `${arg.String()}, `;
      }
    });

    let str = `${this.Function.String()}(${args})`;

    return str;
  }
}
