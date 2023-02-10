FROM node:16

COPY . /

RUN npm ci && npm run build

CMD ["sh", "-c", "/bin/rdme $INPUT_RDME"]
