use crate::graphql::types::color::Color;

use async_graphql::SimpleObject;
use async_graphql::{Scalar, ScalarType, Value};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(SimpleObject, Serialize, Deserialize)]
pub struct ColorMapColor {
    #[serde(rename = "color")]
    pub color: String,
    #[serde(rename = "colorCode")]
    pub color_code: Vec<i32>,
}

impl From<&Color> for ColorMapColor {
    fn from(data: &Color) -> Self {
        Self {
            color: data.color.clone(),
            color_code: data.color_code.clone(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct ColorMapScalar(pub HashMap<i32, Color>);

#[Scalar]
impl ScalarType for ColorMapScalar {
    fn parse(value: async_graphql::Value) -> async_graphql::InputValueResult<Self> {
        Ok(async_graphql::from_value(value)?)
    }

    fn to_value(&self) -> Value {
        Value::Object(
            self.0
                .iter()
                .map(|(k, v)| {
                    (
                        async_graphql::Name::new(k.to_string()),
                        async_graphql::to_value(ColorMapColor::from(v)).unwrap(),
                    )
                })
                .collect(),
        )
    }
}

#[derive(SimpleObject)]
pub struct ColorMap {
    pub color_map: ColorMapScalar,
}
