import { Application } from 'https://deno.land/x/oak/mod.ts';
import _404 from './handler/404.ts';
import router from './router.ts';

const port = Deno.env.get('PORT') || 8000;

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(_404);

console.log(`Listening on port:${port}`);

await app.listen(`localhost:${port}`);
