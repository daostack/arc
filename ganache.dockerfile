# temporaty custom ganache-cli docker image as per:
# https://github.com/graphprotocol/graph-node/issues/375#issuecomment-432751056

FROM node

WORKDIR /usr/app

RUN git clone https://github.com/trufflesuite/ganache-cli.git .
RUN npm i --save https://github.com/trufflesuite/ganache-core.git#develop
RUN npm i

ENV DOCKER true
EXPOSE 8545

ENTRYPOINT ["npm", "start", "--"]