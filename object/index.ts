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

export class Integer {
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
}

export class Bool {
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

export class Null {
  Type() {
    return NULL_OBJ;
  }
  Inspect() {
    return "null";
  }
}
