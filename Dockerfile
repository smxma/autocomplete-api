FROM node:8.9.1-alpine

RUN mkdir -p /opt/app

COPY . /opt/app

WORKDIR /opt/app

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

RUN npm install -g yarn

RUN yarn build 

CMD ["yarn", "start"]
