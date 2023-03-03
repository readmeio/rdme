FROM node:16-alpine as builder

COPY . /rdme

RUN cd /rdme && npm ci && npm run build && npx pkg . --target host --out-path exe

# # A distroless container image with some basics like SSL certificates
# # https://github.com/GoogleContainerTools/distroless
# FROM node:16-alpine
FROM gcr.io/distroless/static-debian11

COPY --from=builder /rdme/exe /exe

ENTRYPOINT ["/exe/rdme $INPUT_RDME"]
