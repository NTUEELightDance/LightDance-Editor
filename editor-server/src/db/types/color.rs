#[derive(sqlx::FromRow, Debug, Clone)]
pub struct ColorData {
    pub id: i32,
    pub name: String,
    pub r: i32,
    pub g: i32,
    pub b: i32,
}
