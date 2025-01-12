use reqwest::Client;

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn ping() {
        let client = Client::new();

        let url = "http://localhost:4000/api/ping"; 

        let response = client.get(url).send().await.unwrap();
        assert_eq!(response.status(), 200);
    }
}
