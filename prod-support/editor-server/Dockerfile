FROM rust:1.75

RUN cargo new editor-server
WORKDIR /editor-server

COPY ./editor-server/.cargo ./.cargo
RUN echo '\n\n[workspace]\nmembers = ["seaorm"]\n' >> ./Cargo.toml

RUN mkdir ./seaorm
COPY ./editor-server/seaorm/Cargo.toml ./seaorm/Cargo.toml
COPY ./editor-server/seaorm/src ./seaorm/src

COPY ./editor-server/seaorm/migration ./seaorm/migration
COPY ./editor-server/Cargo.toml .
COPY ./editor-server/Cargo.lock .

RUN cargo fetch
RUN rm -r ./src

COPY ./editor-server/.env.production ./.env
COPY ./editor-server/src ./src

CMD ["bash", "-c", "cargo run -p seaorm --release -- migrate && cargo run --release"]
