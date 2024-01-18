use async_graphql::{InputObject, SimpleObject};
use serde::{Deserialize, Serialize};
#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
pub struct Frame {
    #[graphql(name = "LEDs")]
    pub leds: Vec<[i32; 2]>,
    pub fade: bool,
    pub start: i32,
}

#[derive(InputObject, Serialize, Deserialize, Default, Debug, Clone)]
pub struct InputFrame {
    #[graphql(name = "LEDs")]
    pub leds: Vec<[i32; 2]>,
    pub fade: bool,
    pub start: i32,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug)]
pub struct LED {
    pub id: i32,
    pub repeat: i32,
    pub frames: Vec<Frame>,
}
