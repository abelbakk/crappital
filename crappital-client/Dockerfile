FROM node:22.14 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openjdk-17-jdk

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=2048

RUN npm run build-docker

FROM node:22.14

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist/crappital-client/browser /app

EXPOSE 80

CMD ["serve", "-s", ".", "-l", "80"]
