ARG NODERED_VERSION=2.2.2
ARG NODEJS_VERSION_MAJOR=16

FROM nodered/node-red:${NODERED_VERSION}-${NODEJS_VERSION_MAJOR} as build-deps
USER node-red
WORKDIR /usr/src/node-red/
RUN npm install --save \
    --unsafe-perm \
    --no-update-notifier \
    --no-fund \
    --only=production  \
    bcrypt \
    sha512crypt-node \
    node-red-contrib-modbus \
    node-red-contrib-modbustcp \
    node-red-contrib-timerswitch \
    node-red-contrib-ui-led \
    node-red-dashboard \
    node-red-node-openweathermap  \
    node-red-contrib-influxdb \
    node-red-node-serialport

#FROM nodered/node-red:${NODERED_VERSION}-${NODEJS_VERSION_MAJOR}-minimal as base
#USER root

#WORKDIR /usr/src/node-red
#COPY --from=build-deps /usr/src/node-red/ /usr/src/node-red/

RUN mkdir -p /usr/src/node-red/node_modules/node-red-auth-pam
COPY ./packages/node-red-auth-pam/ /usr/src/node-red/node_modules/node-red-auth-pam/

RUN chown -R node-red:node-red /usr/src/node-red/
USER node-red

FROM scratch as final
LABEL maintainer = HeroBalancer <development@herobalancer.nl>
LABEL description="node-red with preinstalled modules specifically for HeroBalancer"
COPY --from=build-deps / /
USER node-red
# USER node-red
WORKDIR /usr/src/node-red

EXPOSE 1880
ENTRYPOINT ["npm", "start", "--cache", "/data/.npm", "--", "--userDir", "/data"]
