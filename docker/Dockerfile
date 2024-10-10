FROM node:20.18.0
LABEL author="Armatura" \
      maintainer="alext303@gmail.com"

RUN apt-get update && apt-get install -y curl zip && apt-get clean
RUN useradd -m -d /home/container container
USER container
ENV USER=container HOME=/home/container
WORKDIR /home/container

COPY ./entrypoint.sh /entrypoint.sh

CMD [ "/bin/bash", "/entrypoint.sh" ]
