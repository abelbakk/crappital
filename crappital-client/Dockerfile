FROM node:22.14

WORKDIR /app

# for the openapi generator
RUN apt-get update
RUN apt-get install -y openjdk-17-jdk

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 80

CMD ["sh", "-c", "npm run build-docker && npx serve -s dist/crappital-client/browser -l 80"]
