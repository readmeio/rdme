FROM node:16

COPY . /rdme-docker

RUN cd /rdme-docker && npm ci && npm run build

CMD ["sh", "-c", "/rdme-docker/bin/rdme $INPUT_RDME"]
