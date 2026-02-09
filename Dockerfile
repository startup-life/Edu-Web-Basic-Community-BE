FROM node:22

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3002

CMD ["node", "app.js"]
