use async_graphql::SimpleObject;

use crate::graphql::types::led::Frame;

// #[derive(SimpleObject, Clone, Default)]
// pub struct LEDEffectData {
//     pub id: i32,
//     pub name: String,
//     pub part_name: String,
//     pub position: i32,
//     pub color_id: i32,
//     pub alpha: i32,
// }

#[derive(SimpleObject, Clone, Default)]
pub struct LEDEffectData {
    pub id: i32,
    pub name: String,
    pub part_name: String,
    pub repeat: i32,
    pub frames: Vec<Frame>,
}
