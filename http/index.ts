import { Application } from 'https://deno.land/x/oak/mod.ts';
import { parse } from "https://deno.land/std/flags/mod.ts";
import _404 from './handler/404.ts';
import router from './router.ts';

const args = parse(Deno.args);
const port = args.port || Deno.env.get('PORT') || 8080;

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(_404);

console.log(`Listening on port:${port}`);

await app.listen(`localhost:${port}`);
