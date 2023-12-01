FROM rust:1.70

RUN cargo new editor-server
WORKDIR /editor-server

COPY ./editor-server/.cargo ./.cargo
COPY ./editor-server/prisma ./prisma
RUN echo '\n\n[workspace]\nmembers = ["prisma"]\n' >> ./Cargo.toml

WORKDIR /editor-server/prisma
RUN cargo fetch

WORKDIR /editor-server
RUN cargo prisma migrate deploy

COPY ./editor-server/Cargo.toml .
COPY ./editor-server/Cargo.lock .

RUN cargo fetch
RUN rm -r ./src

COPY ./editor-server/.env.production ./.env
COPY ./editor-server/src ./src

CMD ["bash", "-c", "cargo run --release"]
