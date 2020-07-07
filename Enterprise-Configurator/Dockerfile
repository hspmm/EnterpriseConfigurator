FROM node:11 AS build
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
# RUN npm install
RUN npm install -g @angular/cli@8.2.1
COPY . /usr/src/app
EXPOSE 4200
CMD npm start 

