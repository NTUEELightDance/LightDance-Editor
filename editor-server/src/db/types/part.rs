//! Part data type

#[derive(Debug, sqlx::Decode)]
pub enum PartType {
    LED,
    FIBER,
}
