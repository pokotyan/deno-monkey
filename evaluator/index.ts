import * as ast from "../ast/index.ts";
import * as obj from "../object/index.ts";
import { ReturnValue } from "../object/index.ts";
import * as env from "../object/environment.ts";
import { builtins } from "./builtins.ts";

const TRUE = new obj.Bool(true);
const FALSE = new obj.Bool(false);
export const NULL = new obj.Null();

export const Eval = (node: ast.Node, env: env.Environment): obj.Object => {
  // ------------------------------------------
  // Statements（評価の結果、値を返さない）
  // ------------------------------------------
  if (node instanceof ast.Program) {
    return evalProgram({ program: node, env });
  }

  if (node instanceof ast.ExpressionStatement) {
    return Eval(node.Expression!, env);
  }

  if (node instanceof ast.BlockStatement) {
    return evalBlockStatement({ block: node, env });
  }

  if (node instanceof ast.ReturnStatement) {
    // ReturnStatementが来たら、returnの右側の式(ReturnValue)を評価して、その値をReturnValueにつめて返す。
    // そして、evalProgramでReturnValueの場合は即返すようにしていので、return文の後に何か書いていても評価はもうされない。
    const val = Eval(node.ReturnValue!, env);

    if (isError(val)) {
      return val;
    }

    return new obj.ReturnValue(val);
  }

  if (node instanceof ast.LetStatement) {
    const val = Eval(node.Value!, env);

    if (isError(val)) {
      return val;
    }

    env.Set((node.Name as ast.Identifier).Value, val);
  }

  // ------------------------------------------
  // Expressions（評価の結果、値を返す）
  // ------------------------------------------
  if (node instanceof ast.IntegerLiteral) {
    return new obj.Integer(node.Value);
  }

  if (node instanceof ast.StringLiteral) {
    return new obj.String(node.Value);
  }

  if (node instanceof ast.Boolean) {
    return nativeBoolToBooleanObject(node.Value);
  }

  if (node instanceof ast.PrefixExpression) {
    const right = Eval(node.Right!, env);

    if (isError(right)) {
      return right;
    }

    return evalPrefixExpression({ operator: node.Operator, right });
  }

  if (node instanceof ast.InfixExpression) {
    const left = Eval(node.Left, env);
    if (isError(left)) {
      return left;
    }

    const right = Eval(node.Right!, env);
    if (isError(right)) {
      return right;
    }

    return evalInfixExpression({ operator: node.Operator, left, right });
  }

  if (node instanceof ast.IfExpression) {
    return evalIfExpression({ ie: node, env });
  }

  if (node instanceof ast.Identifier) {
    return evalIdentifier({ node, env });
  }

  if (node instanceof ast.FunctionLiteral) {
    return new obj.Function({ params: node.Parameters, body: node.Body!, env });
  }

  if (node instanceof ast.CallExpression) {
    const func = Eval(node.Function, env);

    if (isError(func)) {
      return func;
    }

    const args = evalExpressions({ exps: node.Arguments, env });
    if (isError(args[0]) && args.length === 1) {
      return args[0];
    }

    return applyFunction({ func, args });
  }

  if (node instanceof ast.ArrayLiteral) {
    const elements = evalExpressions({ exps: node.Elements, env });
    if (isError(elements[0]) && elements.length === 1) {
      return elements[0];
    }

    return new obj.Array(elements);
  }

  if (node instanceof ast.IndexExpression) {
    const left = Eval(node.Left, env);
    if (isError(left)) {
      return left;
    }

    const index = Eval(node.Index!, env);
    if (isError(index)) {
      return index;
    }

    return evalIndexExpression({ left, index });
  }

  if (node instanceof ast.HashLiteral) {
    return evalHashLiteral({ node, env });
  }

  return null as any;
};

const nativeBoolToBooleanObject = (input: boolean) => {
  if (input) {
    return TRUE;
  }
  return FALSE;
};

const evalProgram = ({
  program,
  env,
}: {
  program: ast.Program;
  env: env.Environment;
}) => {
  let result: obj.Object;

  for (const stmt of program.Statements) {
    result = Eval(stmt, env);

    if (result instanceof obj.ReturnValue) {
      return result.Value;
    } else if (result instanceof obj.Error) {
      return result;
    }
  }

  return result!;
};

// const evalStatements = (stmts: ast.Statement[]): obj.Object => {
//   let result!: obj.Object;

//   for (const stmt of stmts) {
//     result = Eval(stmt);
//   }

//   return result;
// };

// 前置演算子で ! が現れたら 右側の 式 の結果を反転させる
const evalBangOperatorExpression = (right: obj.Object) => {
  switch (right) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      // TRU,FALSE,NULLのオブジェクト以外はここにくる。
      // TRU,FALSE,NULLのオブジェクト以外は!で反転するとFALSEとなる。
      // つまりTRU,FALSE,NULLのオブジェクト以外(INTとか)はtruthyなものとして扱う。（0や、-5もtruthy）
      return FALSE;
  }
};

const evalMinusPrefixOperatorExpression = (right: obj.Object) => {
  if (right.Type() != obj.INTEGER_OBJ) {
    return newError(`unknown operator: -${right.Type()}`);
  }

  const value = (right as obj.Integer).Value;

  return new obj.Integer(-value); // 整数のprefixに - をつけたIntegerオブジェクトを返す
};

const evalIntegerInfixExpression = ({
  operator,
  left,
  right,
}: {
  operator: string;
  left: obj.Object;
  right: obj.Object;
}) => {
  const leftVal = (left as obj.Integer).Value;
  const rightVal = (right as obj.Integer).Value;

  switch (operator) {
    case "+":
      return new obj.Integer(leftVal + rightVal);
    case "-":
      return new obj.Integer(leftVal - rightVal);
    case "*":
      return new obj.Integer(leftVal * rightVal);
    case "/":
      return new obj.Integer(leftVal / rightVal);
    case "<":
      return nativeBoolToBooleanObject(leftVal < rightVal);
    case ">":
      return nativeBoolToBooleanObject(leftVal > rightVal);
    case "==":
      return nativeBoolToBooleanObject(leftVal === rightVal);
    case "!=":
      return nativeBoolToBooleanObject(leftVal !== rightVal);
    default:
      return newError(
        `unknown operator: ${left.Type()} ${operator} ${right.Type()}`
      );
  }
};

const evalStringInfixExpression = ({
  operator,
  left,
  right,
}: {
  operator: string;
  left: obj.String;
  right: obj.String;
}) => {
  if (operator != "+") {
    return newError(
      `unknown operator: ${left.Type()} ${operator} ${right.Type()}`
    );
  }
  return new obj.String(`${left.Value}${right.Value}`);
};

const evalInfixExpression = ({
  operator,
  left,
  right,
}: {
  operator: string;
  left: obj.Object;
  right: obj.Object;
}) => {
  if (left.Type() === obj.INTEGER_OBJ && right.Type() === obj.INTEGER_OBJ) {
    return evalIntegerInfixExpression({ operator, left, right });
  } else if (
    left.Type() === obj.STRING_OBJ &&
    right.Type() === obj.STRING_OBJ
  ) {
    const l = left as obj.String;
    const r = right as obj.String;
    return evalStringInfixExpression({ operator, left: l, right: r });
  } else if (operator === "==") {
    return nativeBoolToBooleanObject(left === right);
  } else if (operator === "!=") {
    return nativeBoolToBooleanObject(left !== right);
  } else if (left.Type() !== right.Type()) {
    return newError(
      `type mismatch: ${left.Type()} ${operator} ${right.Type()}`
    );
  } else {
    return newError(
      `unknown operator: ${left.Type()} ${operator} ${right.Type()}`
    );
  }
};

const evalPrefixExpression = ({
  operator,
  right,
}: {
  operator: string;
  right: obj.Object;
}) => {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return newError(`unknown operator: ${operator}${right.Type()}`);
  }
};

const evalBlockStatement = ({
  block,
  env,
}: {
  block: ast.BlockStatement;
  env: env.Environment;
}): obj.Object => {
  let result: obj.Object;

  for (const stmt of block.Statements) {
    result = Eval(stmt, env);

    if (result) {
      const rt = result.Type();

      if (rt === obj.RETURN_VALUE_OBJ || rt === obj.ERROR_OBJ) {
        return result;
      }
    }
  }

  return result!;
};

const isTruthy = (obj: obj.Object): boolean => {
  switch (obj) {
    case NULL:
      return false;
    case TRUE:
      return true;
    case FALSE:
      return false;
    default:
      return true;
  }
};

// if (<condition>) <consequence> else <alternative>
const evalIfExpression = ({
  ie,
  env,
}: {
  ie: ast.IfExpression;
  env: env.Environment;
}) => {
  const condition = Eval(ie.Condition!, env);

  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return Eval(ie.Consequence!, env);
  } else if (ie.Alternative) {
    return Eval(ie.Alternative, env);
  } else {
    return NULL;
  }
};

const evalIdentifier = ({
  node,
  env,
}: {
  node: ast.Identifier;
  env: env.Environment;
}) => {
  const [val, ok] = env.Get(node.Value);
  if (ok) {
    return val;
  }

  if (builtins[node.Value]) {
    return builtins[node.Value];
  }

  return newError(`identifier not found: ${node.Value}`);
};

// 関数の引数郡と配列内の要素の評価
const evalExpressions = ({
  exps,
  env,
}: {
  exps: ast.Expression[];
  env: env.Environment;
}) => {
  let result: obj.Object[] = [];

  for (const exp of exps) {
    const evaluated = Eval(exp, env);

    if (isError(evaluated)) {
      return [evaluated];
    }
    result.push(evaluated);
  }

  return result;
};

const evalIndexExpression = ({
  left,
  index,
}: {
  left: obj.Object;
  index: obj.Object;
}) => {
  if (left.Type() === obj.ARRAY_OBJ && index.Type() === obj.INTEGER_OBJ) {
    return evalArrayIndexExpression({ array: left, index });
  }
  if (left.Type() === obj.HASH_OBJ) {
    return evalHashIndexExpression({ hash: left, index: index });
  }

  return newError(`index operator not supported: ${left.Type()}`);
};

const evalArrayIndexExpression = ({
  array,
  index,
}: {
  array: obj.Object;
  index: obj.Object;
}) => {
  const arr = array as obj.Array;
  const idx = (index as obj.Integer).Value;
  const max = arr.Elements.length - 1;

  // 存在しない添字アクセスはNULLを返す
  if (idx < 0 || idx > max) {
    return NULL;
  }

  return arr.Elements[idx]; // jsの添字を使って添字アクセスを評価する。
};

const evalHashLiteral = ({
  node,
  env,
}: {
  node: ast.HashLiteral;
  env: env.Environment;
}) => {
  const hash = new obj.Hash();

  Object.keys(node.Pairs).forEach((keyString) => {
    const valueNode = node.Pairs[keyString];

    const value = Eval(valueNode, env);
    if (isError(value)) {
      return value;
    }
    const hashPair: obj.HashPair = {
      Key: keyString,
      Value: value,
    };

    hash.Set({ key: keyString, value: hashPair });
  });

  return hash;
};

const evalHashIndexExpression = ({
  hash,
  index,
}: {
  hash: obj.Object;
  index: obj.Object;
}) => {
  const hashObject = hash as obj.Hash;

  const isHashable =
    index instanceof obj.Integer ||
    index instanceof obj.Bool ||
    index instanceof obj.String;

  // astのHash.Pairsのキーにはint、string、boolノードのString()を入れてる。
  // なので
  // int、string、boolノードのString()と、
  // int、string、boolオブジェクトのInspect()の結果は
  // 一致しておく必要がある。
  if (!hashObject.Pairs.hasOwnProperty(index.Inspect())) {
    return NULL;
  }

  return hashObject.Pairs[index.Inspect()].Value;
};

const applyFunction = ({
  func,
  args,
}: {
  func: obj.Object;
  args: obj.Object[];
}) => {
  if (func instanceof obj.Function) {
    const extendedEnv = extendFunctionEnv({ func, args }); // これから評価する関数専用のenvを作る。
    const evaluated = Eval(func.Body, extendedEnv); // bodyを評価する。body内の変数は上で作った関数専用のenvに束縛される。
    return unwrapReturnValue(evaluated); // body内でreturnを使っていたら、returnの式の結果を返す。使ってない場合はbodyの評価結果をそのまま返す
  } else if (func instanceof obj.Builtin) {
    return func.Fn(...args);
  }

  return newError(`not a function: %s", ${func.Type()}`);
};

const extendFunctionEnv = ({
  func,
  args,
}: {
  func: obj.Function;
  args: obj.Object[];
}): env.Environment => {
  // 関数のbody内のためのスコープを作る。fn.Envには関数を定義した場所のスコープが入っている。
  // 外側に「関数定義時の環境」、内側に「関数body内の環境」のenvができる。
  // Functionオブジェクトを作るときに現在の環境（定義時の環境）をfnc.Envに入れてる。これによって関数ごとに「関数定義時の環境」を持つことができるので、関数のネスト（クロージャ）が実現できる。
  const ev = env.NewEnclosedEnvironment(func.Env);

  // 引数をenvに入れる。
  func.Parameters.forEach((param, i) => {
    ev.Set(param.Value, args[i]);
  });

  return ev;
};

const unwrapReturnValue = (obj: obj.Object) => {
  if (obj instanceof ReturnValue) {
    return obj.Value;
  }

  return obj;
};

export const newError = (message: string) => {
  return new obj.Error(message);
};

const isError = (object: obj.Object) => {
  if (object) {
    return object.Type() == obj.ERROR_OBJ;
  }
  return false;
};
