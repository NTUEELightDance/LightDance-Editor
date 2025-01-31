//! User data types.

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct UserData {
    pub id: i32,
    pub name: String,
}
