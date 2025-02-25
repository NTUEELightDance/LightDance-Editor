FROM rust:1.84

RUN cargo new editor-server
WORKDIR /editor-server

COPY ./editor-server/.cargo ./.cargo
RUN echo '\n\n[workspace]\nmembers = ["prisma"]\n' >> ./Cargo.toml

RUN mkdir ./prisma
COPY ./editor-server/prisma/schema.prisma ./prisma/schema.prisma
COPY ./editor-server/prisma/Cargo.toml ./prisma/Cargo.toml
COPY ./editor-server/prisma/src ./prisma/src

RUN cargo prisma validate

COPY ./editor-server/prisma/migrations ./prisma/migrations
COPY ./editor-server/Cargo.toml .
COPY ./editor-server/Cargo.lock .

RUN cargo fetch
RUN rm -r ./src

COPY ./editor-server/.env.production ./.env
COPY ./editor-server/src ./src

CMD ["bash", "-c", "./target/debug/prisma migrate deploy && cargo run --release"]

