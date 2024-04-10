#Should use the puppeteer docker image, instead of creating one from scratch.
#Either that, or download the required lib dependencies that Chrome requires. Else it wont execute on alpine linux

FROM node:alpine
WORKDIR /lokalnytpdfgenapi
COPY . .
ENV HOME=/lokalnytpdfgenapi
RUN npm install
CMD ["node","src/app.js"]
EXPOSE 8050
