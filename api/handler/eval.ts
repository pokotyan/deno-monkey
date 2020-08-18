import { State, Response } from "https://deno.land/x/oak/mod.ts";
import { evaluator } from "../usecase/eval.ts";

export default async ({
  state,
  response,
}: {
  state: State;
  response: Response;
}) => {
  const evaluated = evaluator(state.code);

  response.status = 200;
  response.body = evaluated;
};
