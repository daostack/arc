FROM node:10

# install the 'host' command used to get ip of ipfs container
RUN apt-get update -y && apt-get install dnsutils -y

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.4.0/wait /wait

ADD ops/entry /entry
RUN chmod +x /wait /entry

WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run codegen

ENTRYPOINT [ "/entry" ]
CMD [ "deploy" ]