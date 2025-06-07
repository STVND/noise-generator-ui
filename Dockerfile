FROM alpine:3.21
RUN apk add --no-cache nodejs npm
ADD frontend /frontend
WORKDIR /frontend/image-noise-ui
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev","--", "--host", "0.0.0.0"]