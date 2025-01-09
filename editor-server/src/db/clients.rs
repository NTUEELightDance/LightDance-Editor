//! App clients and related functions.

use redis::Client;
use sqlx::{MySql, MySqlPool, Pool};

#[derive(Clone, Debug)]
pub struct AppClients {
    pub mysql_pool: Pool<MySql>,
    pub redis_client: Client,
}

impl AppClients {
    pub async fn connect(mysql: &'static str, redis: (&'static str, &'static str)) -> Self {
        Self {
            mysql_pool: build_mysql_pool(mysql).await,
            redis_client: build_redis_client(redis.0, redis.1).await,
        }
    }

    pub fn mysql_pool(&self) -> &Pool<MySql> {
        &self.mysql_pool
    }

    pub fn redis_client(&self) -> &Client {
        &self.redis_client
    }
}

pub async fn build_mysql_pool(host: &'static str) -> Pool<MySql> {
    MySqlPool::connect(host)
        .await
        .expect("Failed to create mysql pool")
}

pub async fn build_redis_client(host: &'static str, port: &'static str) -> Client {
    Client::open(format!("redis://{}:{}", host, port)).expect("Failed to create redis client")
}
