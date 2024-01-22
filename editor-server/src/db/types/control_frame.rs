//! ControlFrame data type.

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct ControlFrameData {
    pub id: i32,
    pub start: i32,
    pub fade: bool,
}
