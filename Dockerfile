ARG NODERED_VERSION=4.0.9
ARG NODEJS_VERSION_MAJOR=22

FROM nodered/node-red:${NODERED_VERSION}-${NODEJS_VERSION_MAJOR} as build-deps
USER node-red
WORKDIR /usr/src/node-red/

ENTRYPOINT [ "/bin/bash" ]

RUN npm install --save \
    --unsafe-perm \
    --no-update-notifier \
    --no-fund \
    --omit=dev \
    node-red-contrib-modbus \
    node-red-contrib-modbustcp \
    node-red-contrib-timerswitch \
    node-red-contrib-ui-led \
    node-red-dashboard \
    node-red-node-openweathermap  \
    node-red-contrib-influxdb \
    node-red-contrib-buffer-parser \
    node-red-node-serialport \
    node-red-contrib-bacnet\
    sha512crypt-node \
    bcrypt 

RUN npm rebuild --build-from-source

#FROM nodered/node-red:${NODERED_VERSION}-${NODEJS_VERSION_MAJOR}-minimal as base
USER root

#WORKDIR /usr/src/node-red
#COPY --from=build-deps /usr/src/node-red/ /usr/src/node-red/

RUN mkdir -p /usr/src/node-red/node_modules/node-red-auth-pam
COPY ./packages/node-red-auth-pam/ /usr/src/node-red/node_modules/node-red-auth-pam/

RUN chown -R node-red:node-red /usr/src/node-red/
USER node-red

# Make it one single part since WAGO PLC's are single core and cannot handle multiple
FROM scratch as final
LABEL maintainer = HeroBalancer <development@herobalancer.nl>
LABEL description="node-red with preinstalled modules specifically for HeroBalancer"
COPY --from=build-deps / /
USER node-red
# USER node-redk
WORKDIR /usr/src/node-red

ENV TZ=Europe/Amsterdam

EXPOSE 1880
ENTRYPOINT ["npm", "start", "--cache", "/data/.npm", "--", "--userDir", "/data"]
