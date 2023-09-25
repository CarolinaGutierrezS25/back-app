#######################
# Build for local development
#######################
FROM node:16.18-alpine As development
RUN apk -U upgrade && apk add dumb-init
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
#RUN npm ci
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
USER node

######################
# Build for production
######################
FROM node:16.18-alpine As build
RUN apk -U upgrade && apk add dumb-init
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build --max_old_space_size=4096
ENV NODE_ENV production
#RUN npm ci --only=production && npm cache clean --force
RUN yarn install --frozen-lockfile --production
USER node

#####################
# Production
#####################
FROM node:16.18-alpine As production
RUN apk -U upgrade && apk add dumb-init
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
CMD ["dumb-init", "node", "dist/main.js"]
