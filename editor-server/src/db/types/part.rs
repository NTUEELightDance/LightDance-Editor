//! Part data type

#[derive(Debug, Clone, sqlx::Decode)]
pub enum PartType {
    LED,
    FIBER,
}
