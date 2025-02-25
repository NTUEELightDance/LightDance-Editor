FROM rust:1.84

WORKDIR /app

RUN cargo new file-server

WORKDIR /app/file-server

COPY ./file-server/Cargo.toml .
COPY ./file-server/Cargo.lock .

RUN cargo fetch
RUN rm -r ./src

COPY ./file-server/src ./src

ENV PORT=8081

EXPOSE 8081

CMD ["cargo", "run", "--release"]
