FROM node:18-alpine as builder

COPY . /rdme

RUN cd /rdme && npm ci && npm run build:exe

FROM alpine:3.14

COPY --from=builder /rdme/exe /exe

ENTRYPOINT ["/exe/rdme"]
