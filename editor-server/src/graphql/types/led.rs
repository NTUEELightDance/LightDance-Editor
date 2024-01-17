use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug)]
pub struct Frame {
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
