use async_graphql::{InputObject, SimpleObject};
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
#[graphql(name = "LEDEffectFrame")]
pub struct LEDEffectFrame {
    #[graphql(name = "LEDs")]
    pub leds: Vec<[i32; 2]>,
    pub fade: bool,
    pub start: i32,
}

#[derive(InputObject, Serialize, Deserialize, Default, Debug, Clone)]
pub struct Frame {
    #[graphql(name = "LEDs")]
    pub leds: Vec<[i32; 2]>,
    pub fade: bool,
    pub start: i32,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug)]
#[graphql(name = "LED")]
pub struct LED {
    pub id: i32,
    pub repeat: i32,
    pub frames: Vec<LEDEffectFrame>,
}

#[derive(SimpleObject, Clone, Default)]
#[graphql(name = "LEDEffectData")]
pub struct LEDEffectData {
    pub id: i32,
    pub name: String,
    pub model_name: String,
    pub part_name: String,
    pub repeat: i32,
    pub frames: Vec<LEDEffectFrame>,
}

// #[derive(SimpleObject, Clone, Default)]
// pub struct LEDEffectData {
//     pub id: i32,
//     pub name: String,
//     pub part_name: String,
//     pub position: i32,
//     pub color_id: i32,
//     pub alpha: i32,
// }
