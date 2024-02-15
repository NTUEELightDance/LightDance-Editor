FROM rust:1.75

RUN cargo new editor-server
WORKDIR /editor-server

COPY ./editor-server/.cargo ./.cargo
COPY ./editor-server/prisma ./prisma
RUN rm -r ./prisma/migrations
RUN echo '\n\n[workspace]\nmembers = ["prisma"]\n' >> ./Cargo.toml

RUN cargo prisma validate

COPY ./editor-server/prisma/migrations ./prisma/migrations
COPY ./editor-server/Cargo.toml .
COPY ./editor-server/Cargo.lock .

RUN cargo fetch
RUN rm -r ./src

COPY ./editor-server/.env.production ./.env
COPY ./editor-server/src ./src

CMD ["bash", "-c", "./target/debug/prisma migrate deploy && cargo run --release"]
