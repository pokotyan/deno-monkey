import { State, Request, Response } from "https://deno.land/x/oak/mod.ts";

export default async (
  {
    state,
    request,
    response,
  }: { state: State; request: Request; response: Response },
  next: () => Promise<void>
) => {
  try {
    const buf: Uint8Array = await Deno.readAll(request.serverRequest.body);
    const string = String.fromCharCode.apply(null, buf as any) as string;

    // JSON.parseするために改行とtabを削除
    let str = string.replace(/\r?\n/g, "").replace(/\t/g, "");

    let body: {
      code: string;
    };
    body = JSON.parse(str);

    state.code = body.code;
    await next();
  } catch (err) {
    response.status = 500;
    response.body = { msg: err.message };
  }
};
