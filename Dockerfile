FROM node:16-alpine as builder

COPY . /rdme

RUN cd /rdme && npm ci && npm run build && npx pkg@5 . --target host --out-path bin/docker

FROM alpine:3.14

COPY --from=builder /rdme/bin/docker/rdme /app/rdme
COPY --from=builder /rdme/bin/docker/entrypoint.sh /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
