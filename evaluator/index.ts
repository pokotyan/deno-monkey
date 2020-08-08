import * as ast from "../ast/index.ts";
import * as obj from "../object/index.ts";

const TRUE = new obj.Bool(true);
const FALSE = new obj.Bool(false);
const NULL = new obj.Null();

export const Eval = (node: ast.Node): obj.Object => {
  switch (node.Constructor()) {
    case ast.Program:
      const progamNode = node as ast.Program;

      return evalStatements(progamNode.Statements);
    case ast.ExpressionStatement:
      const expNode = node as ast.ExpressionStatement;

      return Eval(expNode.Expression!);
    case ast.IntegerLiteral:
      const intNode = node as ast.IntegerLiteral;

      return new obj.Integer(intNode.Value);
    case ast.Boolean:
      const boolNode = node as ast.Boolean;

      return nativeBoolToBooleanObject(boolNode.Value);
    case ast.PrefixExpression:
      const peNode = (node as ast.PrefixExpression);
      const right = Eval(peNode.Right!);

      return evalPrefixExpression({ operator: peNode.Operator, right });
    // TODO 次はここ
    // case ast.InfixExpression:
    //   const ieNode = (node as ast.InfixExpression);
    default:
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
