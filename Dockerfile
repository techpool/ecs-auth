FROM 370531249777.dkr.ecr.ap-south-1.amazonaws.com/node:8.3.0

COPY package.json .
RUN npm install

EXPOSE 80

COPY server.js .
COPY worker.js .
COPY service service
COPY util util
COPY config config

CMD [ "npm", "start" ]
