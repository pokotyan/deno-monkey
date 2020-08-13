import * as obj from "../object/index.ts";
import * as ev from "../evaluator/index.ts";

export const builtins: {
  [k: string]: obj.Builtin;
} = {
  puts: new obj.Builtin(
    (...args: obj.Object[]): obj.Object => {
      args.forEach((arg) => {
        console.log(arg.Inspect());
      });
      return ev.NULL;
    }
  ),
  len: new obj.Builtin(
    (...args: obj.Object[]): obj.Object => {
      if (args.length !== 1) {
        return ev.newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      const [arg] = args;
      if (arg instanceof obj.String) {
        return new obj.Integer(arg.Value.length);
      }
      if (arg instanceof obj.Array) {
        return new obj.Integer(arg.Elements.length);
      }

      return ev.newError(`argument to "len" not supported, got ${arg.Type()}`);
    }
  ),
  first: new obj.Builtin(
    (...args: obj.Object[]): obj.Object => {
      if (args.length !== 1) {
        return ev.newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      if (args[0].Type() !== obj.ARRAY_OBJ) {
        return ev.newError(
          `argument to "first" must be ARRAY, got ${args[0].Type()}`
        );
      }

      const arr = args[0] as obj.Array;

      if (arr.Elements.length > 0) {
        return arr.Elements[0];
      }

      return ev.NULL;
    }
  ),
  last: new obj.Builtin(
    (...args: obj.Object[]): obj.Object => {
      if (args.length !== 1) {
        return ev.newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      if (args[0].Type() !== obj.ARRAY_OBJ) {
        return ev.newError(
          `argument to "last" must be ARRAY, got ${args[0].Type()}`
        );
      }

      const arr = args[0] as obj.Array;
      const len = arr.Elements.length;
      const last = len - 1;
      if (len > 0) {
        return arr.Elements[last];
      }

      return ev.NULL;
    }
  ),
  rest: new obj.Builtin(
    (...args: obj.Object[]): obj.Object => {
      if (args.length !== 1) {
        return ev.newError(
          `wrong number of arguments. got=${args.length}, want=1`
        );
      }

      if (args[0].Type() !== obj.ARRAY_OBJ) {
        return ev.newError(
          `argument to "rest" must be ARRAY, got ${args[0].Type()}`
        );
      }

      const arr = args[0] as obj.Array;
      const len = arr.Elements.length;
      if (len > 0) {
        const newElements = arr.Elements.slice(1, len); // 引数で渡された配列は破壊しない
        return new obj.Array(newElements);
      }

      return ev.NULL;
    }
  ),
  push: new obj.Builtin(
    (...args: obj.Object[]): obj.Object => {
      if (args.length !== 2) {
        return ev.newError(
          `wrong number of arguments. got=${args.length}, want=2`
        );
      }

      if (args[0].Type() !== obj.ARRAY_OBJ) {
        return ev.newError(
          `argument to "push" must be ARRAY, got ${args[0].Type()}`
        );
      }

      const arr = args[0] as obj.Array;
      const len = arr.Elements.length;

      const newElements = [...arr.Elements]; // 引数で渡された配列は破壊しない
      newElements[len] = args[1]; // 引数で渡されたものを配列の末尾に入れる。

      return new obj.Array(newElements);
    }
  ),
};
