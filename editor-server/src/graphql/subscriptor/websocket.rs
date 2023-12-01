use crate::graphql::schema::AppSchema;
use crate::types::global::UserContext;

use async_graphql::{
    futures_util::task::{Context, Poll},
    http::{WebSocketProtocols, WsMessage, ALL_WEBSOCKET_PROTOCOLS},
    Data, Executor, Result,
};
use axum::{
    body::{boxed, BoxBody, HttpBody},
    extract::{
        ws::{CloseFrame, Message},
        FromRequestParts, WebSocketUpgrade,
    },
    http::{self, request::Parts, Request, Response, StatusCode},
    response::IntoResponse,
    Error,
};
use futures_util::{
    future,
    future::BoxFuture,
    stream::{SplitSink, SplitStream},
    Sink, SinkExt, Stream, StreamExt,
};
use std::sync::Arc;
use std::{borrow::Cow, convert::Infallible, future::Future, str::FromStr};
use tower_service::Service;

/// A GraphQL protocol extractor.
///
/// It extract GraphQL protocol from `SEC_WEBSOCKET_PROTOCOL` header.
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct GraphQLProtocol(WebSocketProtocols);

#[async_trait::async_trait]
impl<S> FromRequestParts<S> for GraphQLProtocol
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .headers
            .get(http::header::SEC_WEBSOCKET_PROTOCOL)
            .and_then(|value| value.to_str().ok())
            .and_then(|protocols| {
                protocols
                    .split(',')
                    .find_map(|p| WebSocketProtocols::from_str(p.trim()).ok())
            })
            .map(Self)
            .ok_or(StatusCode::BAD_REQUEST)
    }
}

/// A GraphQL subscription service.
pub struct GraphQLSubscription<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut>
where
    OnConnInit: Fn(serde_json::Value) -> OnConnInitFut + Send + 'static,
    OnConnInitFut: Future<Output = Result<UserContext, String>> + Send + 'static,
    OnConnClose: Fn(UserContext) -> OnConnCloseFut + Send + 'static,
    OnConnCloseFut: Future<Output = ()> + Send + 'static,
{
    on_connect: Arc<OnConnInit>,
    on_disconnect: Arc<OnConnClose>,
}

impl<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut> Clone
    for GraphQLSubscription<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut>
where
    OnConnInit: Fn(serde_json::Value) -> OnConnInitFut + Send + Clone + 'static,
    OnConnInitFut: Future<Output = Result<UserContext, String>> + Send + 'static,
    OnConnClose: Fn(UserContext) -> OnConnCloseFut + Send + Clone + 'static,
    OnConnCloseFut: Future<Output = ()> + Send + 'static,
{
    fn clone(&self) -> Self {
        Self {
            on_connect: self.on_connect.clone(),
            on_disconnect: self.on_disconnect.clone(),
        }
    }
}

impl<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut>
    GraphQLSubscription<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut>
where
    OnConnInit: Fn(serde_json::Value) -> OnConnInitFut + Send + 'static,
    OnConnInitFut: Future<Output = Result<UserContext, String>> + Send + 'static,
    OnConnClose: Fn(UserContext) -> OnConnCloseFut + Send + 'static,
    OnConnCloseFut: Future<Output = ()> + Send + 'static,
{
    /// Create a GraphQL subscription service.
    pub fn new(on_connect: OnConnInit, on_disconnect: OnConnClose) -> Self {
        Self {
            on_connect: Arc::new(on_connect),
            on_disconnect: Arc::new(on_disconnect),
        }
    }
}

impl<B, OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut> Service<Request<B>>
    for GraphQLSubscription<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut>
where
    B: HttpBody + Send + 'static,
    OnConnInit: Fn(serde_json::Value) -> OnConnInitFut + Send + Sync + 'static,
    OnConnInitFut: Future<Output = Result<UserContext, String>> + Send + 'static,
    OnConnClose: Fn(UserContext) -> OnConnCloseFut + Send + Sync + 'static,
    OnConnCloseFut: Future<Output = ()> + Send + 'static,
{
    type Response = Response<BoxBody>;
    type Error = Infallible;
    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, req: Request<B>) -> Self::Future {
        let executor = req.extensions().get::<AppSchema>().unwrap().clone();
        let on_connect = self.on_connect.clone();
        let on_disconnect = self.on_disconnect.clone();

        Box::pin(async move {
            let (mut parts, _body) = req.into_parts();

            let protocol = match GraphQLProtocol::from_request_parts(&mut parts, &()).await {
                Ok(protocol) => protocol,
                Err(err) => return Ok(err.into_response().map(boxed)),
            };
            let upgrade = match WebSocketUpgrade::from_request_parts(&mut parts, &()).await {
                Ok(protocol) => protocol,
                Err(err) => return Ok(err.into_response().map(boxed)),
            };

            let resp = upgrade
                .protocols(ALL_WEBSOCKET_PROTOCOLS)
                .on_upgrade(move |stream| {
                    GraphQLWebSocket::new(stream, executor, protocol)
                        .serve(on_connect, on_disconnect)
                });
            Ok(resp.into_response().map(boxed))
        })
    }
}

/// A Websocket connection for GraphQL subscription.
pub struct GraphQLWebSocket<Sink, Stream, E> {
    sink: Sink,
    stream: Stream,
    executor: E,
    data: Data,
    protocol: GraphQLProtocol,
}

impl<S, E> GraphQLWebSocket<SplitSink<S, Message>, SplitStream<S>, E>
where
    S: Stream<Item = Result<Message, Error>> + Sink<Message>,
    E: Executor,
{
    /// Create a [`GraphQLWebSocket`] object.
    pub fn new(stream: S, executor: E, protocol: GraphQLProtocol) -> Self {
        let (sink, stream) = stream.split();
        GraphQLWebSocket::new_with_pair(sink, stream, executor, protocol)
    }
}

impl<Sink, Stream, E> GraphQLWebSocket<Sink, Stream, E>
where
    Sink: futures_util::sink::Sink<Message>,
    Stream: futures_util::stream::Stream<Item = Result<Message, Error>>,
    E: Executor,
{
    /// Create a [`GraphQLWebSocket`] object with sink and stream objects.
    pub fn new_with_pair(
        sink: Sink,
        stream: Stream,
        executor: E,
        protocol: GraphQLProtocol,
    ) -> Self {
        GraphQLWebSocket {
            sink,
            stream,
            executor,
            data: Data::default(),
            protocol,
        }
    }
}

impl<Sink, Stream, E> GraphQLWebSocket<Sink, Stream, E>
where
    Sink: futures_util::sink::Sink<Message>,
    Stream: futures_util::stream::Stream<Item = Result<Message, Error>>,
    E: Executor,
{
    /// Processing subscription requests.
    pub async fn serve<OnConnInit, OnConnInitFut, OnConnClose, OnConnCloseFut>(
        self,
        on_connect: Arc<OnConnInit>,
        on_disconnect: Arc<OnConnClose>,
    ) where
        OnConnInit: Fn(serde_json::Value) -> OnConnInitFut + Send + 'static,
        OnConnInitFut: Future<Output = Result<UserContext, String>> + Send + 'static,
        OnConnClose: Fn(UserContext) -> OnConnCloseFut + Send + 'static,
        OnConnCloseFut: Future<Output = ()> + Send + 'static,
    {
        let input = self
            .stream
            .take_while(|res| future::ready(res.is_ok()))
            .map(Result::unwrap)
            .filter_map(|msg| match msg {
                Message::Text(_) | Message::Binary(_) | Message::Close(_) => {
                    future::ready(Some(msg))
                }
                _ => future::ready(None),
            })
            .map(Message::into_data);

        let mut is_closed = false;
        let (tx, rx) = std::sync::mpsc::channel();

        let stream =
            async_graphql::http::WebSocket::new(self.executor.clone(), input, self.protocol.0)
                .connection_data(self.data)
                .on_connection_init(|value| async move {
                    let _ = match tx.send(value) {
                        Ok(_) => Ok(()),
                        Err(_) => {
                            println!("send error");
                            Err(async_graphql::Error::new("send error"))
                        }
                    };
                    Ok(Data::default())
                })
                .map(|msg| match msg {
                    WsMessage::Text(text) => Message::Text(text),
                    WsMessage::Close(code, status) => {
                        is_closed = true;
                        Message::Close(Some(CloseFrame {
                            code,
                            reason: Cow::from(status),
                        }))
                    }
                });

        let sink = self.sink;
        futures_util::pin_mut!(stream, sink);

        let mut verified = false;
        let mut context = None;

        while let Some(item) = stream.next().await {
            if !verified {
                let connection_param = rx.recv().unwrap_or(serde_json::Value::Null);
                if let serde_json::Value::Object(_) = connection_param {
                    let authencation = on_connect(connection_param).await;
                    match authencation {
                        Ok(user_context) => {
                            verified = true;
                            context = Some(user_context);
                        }
                        Err(err) => {
                            let _ = sink
                                .send(Message::Close(Some(CloseFrame {
                                    code: 400,
                                    reason: Cow::from(err),
                                })))
                                .await;
                            break;
                        }
                    }
                }
            }
            let _ = sink.send(item).await;
        }

        if let Some(context) = context {
            if is_closed {
                on_disconnect(context).await;
            }
        }
    }
}
