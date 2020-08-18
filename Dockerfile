FROM hayd/alpine-deno:1.2.0

WORKDIR /app

COPY . ./

RUN deno cache http/index.ts

ENV PORT=${PORT}

CMD ["run", "--allow-env", "--allow-net", "--allow-read", "http/index.ts", "--mode=api"]
