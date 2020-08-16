import { Router } from "https://deno.land/x/oak/mod.ts";
import parser from "./middleware/parser.ts";
import evaluator from "./handler/eval.ts";
import ast from "./handler/ast.ts";

const router = new Router();

router.post("/eval", parser, evaluator);
router.post("/ast", parser, ast);

export default router;
