import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import _404 from "./handler/404.ts";
import router from "./router.ts";

const port = Deno.env.get("PORT") || 8080;

const app = new Application();

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(_404);

console.log(`Listening on port:${port}`);

await app.listen(`0.0.0.0:${port}`);
