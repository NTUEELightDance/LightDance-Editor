FROM rust:1.91

RUN cargo new editor-server
WORKDIR /editor-server

COPY ./editor-server/.cargo ./.cargo
COPY ./editor-server/Cargo.toml .
COPY ./editor-server/Cargo.lock .
COPY ./editor-server/sea-orm ./sea-orm

RUN cargo fetch
RUN rm -r ./src

COPY ./editor-server/.env.production ./.env
COPY ./editor-server/src ./src

CMD ["bash", "-c", "cargo run -p migration --release -- up && cargo run --release"]
