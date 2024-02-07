use std::env;
use std::time;

fn main() {
    let args: Vec<String> = env::args().collect();

    // Check MySQL connection when migrating
    if args.len() >= 2 && args[1] == "migrate" {
        dotenv::dotenv().ok();

        let mysql_host = env::var("DATABASE_URL").expect("DATABASE_URL is not set");
        println!("MySQL Host: {}", mysql_host);

        while let Err(_) = mysql::Conn::new(mysql_host.as_str()) {
            println!("Waiting for mysql to start...");
            std::thread::sleep(time::Duration::from_secs(1));
        }
        println!("MySQL is up and running!");
    }

    prisma_client_rust_cli::run();
}
