//! Dancer data type.

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct DancerData {
    pub id: i32,
    pub name: String,
}