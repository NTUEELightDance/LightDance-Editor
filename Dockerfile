FROM node:14.15.5
ENV NODE_ENV=production
WORKDIR /app
RUN npm install
RUN npm run build
CMD [ "npm", "start" ]