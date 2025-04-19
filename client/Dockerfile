# # Frontend Dockerfile
# FROM node:18

# WORKDIR /app

# COPY package*.json ./
# RUN npm install
# Frontend Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Use a lightweight web server to serve the frontend
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "8080"]
