FROM node:14.18.1
# ENV NODE_ENV=production

WORKDIR /handlers

# Run docker build from `bash` folder 

COPY ["./../handlers/package.json", "./../handlers/package-lock.json*", "./"]

RUN npm install

COPY ["./../handlers/", "./"]

CMD [ "npm", "test" ]