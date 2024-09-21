FROM node:22.9.0-bullseye-slim

RUN apt update && \
    apt install -y \
    sudo \
    git
RUN echo 'node ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

COPY ./entrypoint.sh /entrypoint
RUN chmod +x /entrypoint
ENTRYPOINT [ "/entrypoint" ]

USER node
