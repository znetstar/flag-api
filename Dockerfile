FROM node:10

ADD . /app

WORKDIR /app

EXPOSE 80

ENV PORT 80

RUN npm install

CMD npm start