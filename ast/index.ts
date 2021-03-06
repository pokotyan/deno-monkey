import * as ast from "../ast/index.ts";
import * as token from "../token/index.ts";

export interface Node {
  TokenLiteral(): string;
  String(): string;
}

export interface Statement extends Node {
  statementNode(): any;
}

export interface Expression extends Node {
  expressionNode(): any;
}

export class Program implements Node {
  Statements: Statement[];

  constructor() {
    this.Statements = [];
  }

  TokenLiteral() {
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
  Name: Identifier | string;
  Value: Expression | null;

  constructor(token: token.Token) {
    this.Token = token;
    this.Name = "";
    this.Value = null;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  statementNode() {}

  String() {
    let str = `${this.TokenLiteral()} ${(this
      .Name as ast.Identifier).String()} = `;

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
  ReturnValue: Expression | null;

  constructor(token: token.Token) {
    this.Token = token;
    this.ReturnValue = null;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  statementNode() {}

  String() {
    let str = `${this.TokenLiteral()} `;

    if (this.ReturnValue) {
      str += this.ReturnValue.String();
    }

    str += ";";

    return str;
  }
}

export class ExpressionStatement implements Statement {
  Token: token.Token;
  Expression: Expression | null;

  constructor(token: token.Token) {
    this.Token = token;
    this.Expression = null;
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
  Right: Expression | null;

  constructor({ token, operator }: { token: token.Token; operator: string }) {
    this.Token = token;
    this.Operator = operator;
    this.Right = null;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    const str = `(${this.Operator}${this.Right!.String()})`;
    return str;
  }
}

export class InfixExpression implements Expression {
  Token: token.Token;
  Left: Expression;
  Operator: string;
  Right: Expression | null;

  constructor({
    token,
    operator,
    left,
  }: {
    token: token.Token;
    operator: string;
    left: Expression;
  }) {
    this.Token = token;
    this.Operator = operator;
    this.Left = left;
    this.Right = null;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    const str = `(${this.Left.String()} ${
      this.Operator
    } ${this.Right!.String()})`;
    return str;
  }
}

export class Boolean implements Expression {
  Token: token.Token;
  Value: boolean;

  constructor({ token, value }: { token: token.Token; value: boolean }) {
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
  Condition: Expression | null;
  Consequence: BlockStatement | null;
  Alternative: BlockStatement | null;

  constructor(token: token.Token) {
    this.Token = token;
    this.Condition = null;
    this.Consequence = null;
    this.Alternative = null;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let str = `if${this.Condition!.String()} ${this.Consequence!.String()}`;

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
  Body: BlockStatement | null;

  constructor(token: token.Token) {
    this.Token = token;
    this.Parameters = [];
    this.Body = null;
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

    let str = `${this.TokenLiteral()}(${params}) ${this.Body!.String()}`;

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

export class StringLiteral implements Expression {
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
    return this.Token.Literal;
  }
}

export class ArrayLiteral implements Expression {
  Token: token.Token;
  Elements: Expression[];

  constructor(token: token.Token) {
    this.Token = token;
    this.Elements = [];
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let elems = "";

    this.Elements.forEach((elem, i) => {
      const lastIndex = Math.max(this.Elements.length - 1, 0);
      if (i === lastIndex) {
        elems += `${elem.String()}`;
      } else {
        elems += `${elem.String()}, `;
      }
    });

    let str = `[${elems}]`;

    return str;
  }
}

// 添字。
// [1,2,3,4][2]
// myArray[2]
// myArray[2 + 1]
// returnArray()[1]
export class IndexExpression implements Expression {
  Token: token.Token;
  Left: Expression;
  Index: Expression | null;

  constructor({ token, left }: { token: token.Token; left: Expression }) {
    this.Token = token;
    this.Left = left;
    this.Index = null;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let str = `(${this.Left.String()}[${this.Index!.String()}])`;

    return str;
  }
}

export class HashLiteral implements Expression {
  Token: token.Token;
  Pairs: {
    [k: string]: Expression; // キーはint、string、boolノードのString()
  };

  constructor(token: token.Token) {
    this.Token = token;
    this.Pairs = {};
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  expressionNode() {}

  String() {
    let pairs = "";

    Object.keys(this.Pairs).forEach((key, i) => {
      const k = (key as unknown) as ast.Expression;
      const value = this.Pairs[key];
      const lastIndex = Math.max(Object.keys(this.Pairs).length - 1, 0);
      if (i === lastIndex) {
        pairs += `${k.String()}:${value.String()}`;
      } else {
        pairs += `${k.String()}:${value.String()}, `;
      }
    });

    let str = `{${pairs}}`;

    return str;
  }
}
