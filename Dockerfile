FROM node:16-alpine as builder

COPY . /rdme

RUN cd /rdme && npm ci && npm run build && npx pkg . --target host --out-path exe

FROM alpine:3.14

COPY --from=builder /rdme/exe /exe

ENTRYPOINT ["sh", "-c", "/exe/rdme $INPUT_RDME"]
