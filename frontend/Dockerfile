# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app

# Optional: backend URL baked into the build (Create React App reads it at build time).
# Left empty, the app falls back to http://localhost:8080.
ARG REACT_APP_API_URL=""
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the built app with a lightweight web server
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]