import { Application } from "https://deno.land/x/oak/mod.ts";
import router from "../http/router.ts";

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on port:8000`);

await app.listen("localhost:8000");
