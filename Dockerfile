FROM node:16

COPY . /app/
WORKDIR /app

RUN mkdir -p /root/.cache/hardhat-nodejs && chmod -R 777 /root/
RUN yarn install

CMD ["./run.sh"]
