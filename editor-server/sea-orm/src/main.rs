use migration::{Migrator, MigratorTrait};
use sea_orm::Database;
use std::env::{args, var};
use std::time;

#[tokio::main]
async fn main() {
    let args: Vec<String> = args().collect();

    // Check MySQL connection when migrating
    if args.len() >= 2 && args[1] == "migrate" {
        dotenv::dotenv().ok();

        let mysql_host = var("DATABASE_URL").expect("DATABASE_URL is not set");
        println!("MySQL Host: {}", mysql_host);

        loop {
            let connection = match Database::connect(mysql_host.as_str()).await {
                Ok(conn) => conn,
                Err(_) => {
                    println!("Waiting for mysql to start...");
                    tokio::time::sleep(time::Duration::from_secs(1)).await;
                    continue;
                }
            };

            match Migrator::up(&connection, None).await {
                Ok(_) => {
                    println!("Migration completed!");
                    break;
                }
                Err(e) => {
                    println!("Migration failed: {:?}. Retrying in 1 second...", e);
                    tokio::time::sleep(time::Duration::from_secs(1)).await;
                    continue;
                }
            }
        }
    }
}