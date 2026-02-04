use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct LEDPart {
    pub id: i32,
    pub len: i32,
}

impl LEDPart {
    pub fn get_len(&self) -> i32 {
        self.len
    }

    pub fn get_id(&self) -> i32 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetControlDatQuery {
    pub dancer: String,
    #[serde(rename = "OFPARTS")]
    pub of_parts: HashMap<String, i32>,
    #[serde(rename = "LEDPARTS")]
    pub led_parts: HashMap<String, LEDPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetDataFailedResponse {
    pub err: String,
}
