FROM node:16

COPY . /rdme

RUN cd /rdme && npm ci && npm run build

CMD ["sh", "-c", "/rdme/bin/rdme $INPUT_RDME"]
