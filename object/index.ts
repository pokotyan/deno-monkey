import * as ast from "../ast/index.ts";
import { Environment } from "./environment.ts";

type ObjectType = string;

export const NULL_OBJ = "NULL";
export const ERROR_OBJ = "ERROR";
export const INTEGER_OBJ = "INTEGER";
export const BOOLEAN_OBJ = "BOOLEAN";
export const STRING_OBJ = "STRING";
export const RETURN_VALUE_OBJ = "RETURN_VALUE";
export const FUNCTION_OBJ = "FUNCTION";
export const BUILTIN_OBJ = "BUILTIN";
export const ARRAY_OBJ = "ARRAY";
export const HASH_OBJ = "HASH";

export interface Object {
  Type(): ObjectType;
  Inspect(): string;
}

export class Integer implements Object {
  Value: number;

  constructor(value: number) {
    this.Value = value;
  }

  Type() {
    return INTEGER_OBJ;
  }
  Inspect() {
    return `${this.Value}`;
  }

  // HashKey(): HashKey {
  //   return {
  //     Type: this.Type(),
  //     Value: this.Value,
  //   };
  // }
}

export class Bool implements Object {
  Value: boolean;

  constructor(value: boolean) {
    this.Value = value;
  }

  Type() {
    return BOOLEAN_OBJ;
  }
  Inspect() {
    return `${this.Value}`;
  }
}

export class Null implements Object {
  Type() {
    return NULL_OBJ;
  }
  Inspect() {
    return "null";
  }
}

export class ReturnValue implements Object {
  Value: Object;

  constructor(value: Object) {
    this.Value = value;
  }

  Type() {
    return RETURN_VALUE_OBJ;
  }
  Inspect() {
    return this.Value.Inspect();
  }
}

// もし字句解析器がエラー発生時、行やカラムの番号をトークンに付与するようになっていれば、ここにはそのプロパティが追加される
export class Error implements Object {
  Message: string;

  constructor(message: string) {
    this.Message = message;
  }

  Type() {
    return ERROR_OBJ;
  }
  Inspect() {
    return `ERROR: ${this.Message}`;
  }
}

export class Function implements Object {
  Parameters: ast.Identifier[];
  Body: ast.BlockStatement;
  Env: Environment;

  constructor({
    params,
    body,
    env,
  }: {
    params: ast.Identifier[];
    body: ast.BlockStatement;
    env: Environment;
  }) {
    this.Parameters = params;
    this.Body = body;
    this.Env = env;
  }

  Type() {
    return FUNCTION_OBJ;
  }
  Inspect() {
    let params = "";

    this.Parameters.forEach((param, i) => {
      const lastIndex = Math.max(this.Parameters.length - 1, 0);
      if (i === lastIndex) {
        params += `${param.String()}`;
      } else {
        params += `${param.String()}, `;
      }
    });

    let str = `fn(${params}) {\n${this.Body.String()}\n}`;

    return str;
  }
}

export class String implements Object {
  Value: string;

  constructor(value: string) {
    this.Value = value;
  }

  Type() {
    return STRING_OBJ;
  }
  Inspect() {
    return this.Value;
  }
}

export type BuiltinFunction = (...args: Object[]) => Object;

export class Builtin implements Object {
  Fn: BuiltinFunction;

  constructor(fn: BuiltinFunction) {
    this.Fn = fn;
  }

  Type() {
    return BUILTIN_OBJ;
  }
  Inspect() {
    return "builtin function";
  }
}

export class Array implements Object {
  Elements: Object[];

  constructor(elements: Object[]) {
    this.Elements = elements;
  }

  Type() {
    return ARRAY_OBJ;
  }
  Inspect() {
    let elems = "";

    this.Elements.forEach((elem, i) => {
      const lastIndex = Math.max(this.Elements.length - 1, 0);
      if (i === lastIndex) {
        elems += `${elem.Inspect()}`;
      } else {
        elems += `${elem.Inspect()}, `;
      }
    });

    return `[${elems}]`;
  }
}

type HashKey = {
  Type: ObjectType;
  Value: number;
};
export type HashPair = {
  Key: string;
  Value: Object;
};

export class Hash implements Object {
  Pairs: {
    [k: string]: HashPair;
  };

  constructor() {
    this.Pairs = {};
  }

  Set({ key, value }: { key: string; value: HashPair }) {
    this.Pairs[key] = value;
  }

  Type() {
    return HASH_OBJ;
  }
  Inspect() {
    let pairs = "";

    Object.values(this.Pairs).forEach((pair, i) => {
      const len = Object.keys(this.Pairs).length;
      const lastIndex = Math.max(len - 1, 0);
      if (i === lastIndex) {
        pairs += `${pair.Key}: ${pair.Value.Inspect()}`;
      } else {
        pairs += `${pair.Key}: ${pair.Value.Inspect()}, `;
      }
    });

    return `{${pairs}}`;
  }
}
