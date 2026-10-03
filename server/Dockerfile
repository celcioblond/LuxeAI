FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /backend

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

USER node

EXPOSE 5001

CMD ["node", "server.js"]
