import { State, Response } from "https://deno.land/x/oak/mod.ts";
import { ast } from "../usecase/ast.ts";

export default async ({
  state,
  response,
}: {
  state: State;
  response: Response;
}) => {
  const result = ast(state.code);

  response.status = 200;
  response.body = result;
};
