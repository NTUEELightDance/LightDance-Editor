//! ControlFrame data type.

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct ControlFrameData {
    pub id: i32,
    pub start: i32,
    // pub fade: bool,
    pub meta_rev: i32,
    pub data_rev: i32,
}
