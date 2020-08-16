[Go 言語でつくるインタプリタ](https://www.oreilly.co.jp/books/9784873118222/)を Deno で再実装したものです。
repl と api サーバーの二通りの起動方法があります。

# repl

monkey の repl が起動します。

`deno run --allow-net --allow-read index.ts --mode=repl`

# api

api サーバーが起動します。

`deno run --allow-net --allow-read index.ts --mode=api`

## /eval

body で渡した monkey のコードの評価結果を返します。

`curl -X POST 'http://localhost:8000/eval' -d '{"code":"1+2"}'`

```
3
```

## /ast

body で渡した monkey のコードの ast を返します。

`curl -X POST 'http://localhost:8000/ast/' -d '{"code":"1+2"}'`

```
{
  "Statements": [
    {
      "Token": {
        "Type": "INT",
        "Literal": "1"
      },
      "Expression": {
        "Token": {
          "Type": "+",
          "Literal": "+"
        },
        "Operator": "+",
        "Left": {
          "Token": {
            "Type": "INT",
            "Literal": "1"
          },
          "Value": 1
        },
        "Right": {
          "Token": {
            "Type": "INT",
            "Literal": "2"
          },
          "Value": 2
        }
      }
    }
  ]
}
```
