import * as ast from "../ast/index.ts";
import * as obj from "../object/index.ts";

const TRUE = new obj.Bool(true);
const FALSE = new obj.Bool(false);
const NULL = new obj.Null();

const isProgram = (node: ast.Node): node is ast.Program =>
  node instanceof ast.Program;

const isExpressionStatement = (
  node: ast.Node,
): node is ast.ExpressionStatement => node instanceof ast.ExpressionStatement;

const isIntegerLiteral = (node: ast.Node): node is ast.IntegerLiteral =>
  node instanceof ast.IntegerLiteral;

const isBoolean = (node: ast.Node): node is ast.Boolean =>
  node instanceof ast.Boolean;

const isPrefixExpression = (node: ast.Node): node is ast.PrefixExpression =>
  node instanceof ast.PrefixExpression;

// const isInfixExpression = (node: ast.Node): node is ast.InfixExpression =>
//   node instanceof ast.InfixExpression;

export const Eval = (node: ast.Node): obj.Object => {
  if (isProgram(node)) {
    return evalStatements(node.Statements);
  } else if (isExpressionStatement(node)) {
    return Eval(node.Expression!);
  } else if (isIntegerLiteral(node)) {
    return new obj.Integer(node.Value);
  } else if (isBoolean(node)) {
    return nativeBoolToBooleanObject(node.Value);
  } else if (isPrefixExpression(node)) {
    const right = Eval(node.Right!);
    return evalPrefixExpression({ operator: node.Operator, right });
    // TODO 次はここ
    // } else if (isInfixExpression(node)) {
  } else {
    return null as any;
  }
};

const nativeBoolToBooleanObject = (input: boolean) => {
  if (input) {
    return TRUE;
  }
  return FALSE;
};

const evalStatements = (stmts: ast.Statement[]): obj.Object => {
  let result!: obj.Object;

  for (const stmt of stmts) {
    result = Eval(stmt);
  }

  return result;
};

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
    return NULL;
  }

  const value = (right as obj.Integer).Value;

  return new obj.Integer(-value); // 整数のprefixに - をつけたIntegerオブジェクトを返す
};

const evalPrefixExpression = (
  { operator, right }: { operator: string; right: obj.Object },
) => {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return NULL;
  }
};
