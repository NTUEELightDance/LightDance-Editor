use std::collections::{HashMap, HashSet};

use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Json,
};
use itertools::Itertools;

use crate::{global, utils::vector::partition_by_field};

use super::{
    types::{Color, GetControlDatQuery, GetDataFailedResponse},
    utils::{alpha, gradient_to_rgb_float, interpolate_gradient, write_little_endian, IntoResult},
};

type GetDataResponse = Vec<u8>;

const VERSION: [u8; 2] = [0, 0];

#[derive(Debug)]
struct Effect {
    // effect_id: i32,
    colors: Vec<[i32; 4]>,
}

// struct OFPart {
//     id: i32,
//
// }

#[derive(Debug, Default)]
struct FrameData {
    // id: i32,
    start_time: u32,
    fade: u8,
    // (part_id, color)
    of_grb_data: HashMap<i32, [i32; 3]>,
    // (part_id, color[])
    led_grb_data: HashMap<i32, Vec<[i32; 3]>>,
    checksum: u32,
}

pub async fn frame_dat(
    query: Json<GetControlDatQuery>,
) -> Result<
    (StatusCode, (HeaderMap, Json<GetDataResponse>)),
    (StatusCode, Json<GetDataFailedResponse>),
> {
    let mut response: Vec<u8> = Vec::new();
    for v in VERSION {
        response.push(v);
    }

    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();

    let GetControlDatQuery {
        dancer,
        of_parts,
        led_parts,
    } = query.0;

    let colors = sqlx::query!(
        r#"
            SELECT Color.r, Color.g, Color.b, Color.id
            FROM Color
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let of_filter: HashSet<String> = HashSet::from_iter(of_parts.iter().map(|part| part.0.clone()));

    let led_filter: HashSet<String> =
        HashSet::from_iter(led_parts.iter().map(|part| part.0.clone()));

    // (id, color)
    let colors: HashMap<i32, Color> = HashMap::from_iter(colors.iter().map(|color| {
        (
            color.id,
            Color {
                r: color.r,
                g: color.g,
                b: color.b,
            },
        )
    }));

    let dancer_id = sqlx::query!(
        r#"
            SELECT
                Dancer.id
            FROM Dancer
            WHERE Dancer.name = ?
        "#,
        dancer
    )
    .fetch_one(mysql_pool)
    .await
    .map_err(|_| {
        (
            StatusCode::NOT_FOUND,
            Json(GetDataFailedResponse {
                err: "Dancer not found.".to_string(),
            }),
        )
    })?
    .id;

    // // TODO: make this more efficient
    // // now the query goes over all control datas but only retrieves the frames
    // let _frames = sqlx::query!(
    //     r#"
    //         SELECT
    //             ControlFrame.id as "control_frame_id",
    //             ControlFrame.start as "control_frame_start",
    //             ControlFrame.fade_for_new_status as "control_frame_fade"
    //         FROM Dancer
    //         INNER JOIN Model
    //             ON Model.id = Dancer.model_id
    //         INNER JOIN ControlData
    //             ON ControlData.dancer_id = Dancer.id
    //         INNER JOIN ControlFrame
    //             ON ControlFrame.id = ControlData.frame_id
    //         WHERE Dancer.id = ?
    //         ORDER BY ControlFrame.start ASC;
    //     "#,
    //     dancer_id
    // )
    // .fetch_all(mysql_pool)
    // .await
    // .into_result()?;

    // let parts = sqlx::query!(
    //     r#"
    //         SELECT
    //             Part.id,
    //             Part.name,
    //             Part.length,
    //             Part.type
    //         FROM Dancer
    //         INNER JOIN Model
    //             ON Model.id = Dancer.model_id
    //         INNER JOIN Part
    //             ON Part.model_id = Model.id
    //         WHERE Dancer.id = ?
    //     "#,
    //     dancer_id
    // )
    // .fetch_all(mysql_pool)
    // .await
    // .into_result()?;

    let of_data = sqlx::query!(
        r#"
            SELECT
                Part.id as "part_id",
                Part.name as "part_name",
                ControlFrame.id as "contorl_frame_id",
                ControlData.color_id as "color_id",
                ControlData.alpha
            FROM Dancer
          INNER JOIN Model
                ON Model.id = Dancer.model_id
            INNER JOIN Part
                ON Part.model_id = Model.id
            INNER JOIN ControlData
                ON ControlData.part_id = Part.id AND
                ControlData.dancer_id = Dancer.id
            INNER JOIN ControlFrame
                ON ControlFrame.id = ControlData.frame_id
            WHERE Dancer.id = ? AND Part.type = 'FIBER'
            ORDER BY ControlFrame.start ASC;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?
    .into_iter()
    .filter(|data| of_filter.contains(&data.part_name))
    .collect_vec();

    // ((frame_id, part_id), color)
    let of_data: HashMap<(i32, i32), [i32; 4]> = HashMap::from_iter(of_data.iter().map(|data| {
        let color = match data.color_id {
            Some(id) => colors.get(&id).unwrap_or(&Color { r: 0, g: 0, b: 0 }),
            None => &Color { r: 0, g: 0, b: 0 },
        };

        (
            (data.contorl_frame_id, data.part_id),
            [color.r, color.g, color.b, data.alpha.unwrap()],
        )
    }));

    let mut effects: HashMap<i32, Effect> = HashMap::new();

    let effect_state_data = sqlx::query!(
        r#"
            SELECT
                LEDEffectState.color_id,
                LEDEffectState.alpha,
                LEDEffectState.position,
                LEDEffectState.effect_id,
                LEDEffect.part_id,
                Part.name as "part_name"
            FROM LEDEffectState
            INNER JOIN LEDEffect
                ON LEDEffectState.effect_id = LEDEffect.id
            INNER JOIN Part
                ON Part.id = LEDEffect.part_id
            ORDER BY LEDEffectState.effect_id, LEDEffectState.position;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?
    .into_iter()
    .filter(|data| led_filter.contains(&data.part_name))
    .collect_vec();

    // .for_each(|data| effects.entry(data.effect_id).and_modify(|v| {
    //     v.colors[data.position] = colors.get()
    // }));

    // TODO: fix super super dirty code
    for data in effect_state_data {
        if let Some(effect) = effects.get_mut(&data.effect_id) {
            let color_value = effect
                .colors
                .get_mut(data.position as usize)
                .ok_or("LED position out of bounds")
                .into_result()?;

            let color = colors
                .get(&data.color_id)
                .unwrap_or(&Color { r: 0, g: 0, b: 0 });

            *color_value = [color.r, color.g, color.b, data.alpha];
        } else {
            let color = colors
                .get(&data.color_id)
                .unwrap_or(&Color { r: 0, g: 0, b: 0 });
            effects.insert(
                data.effect_id,
                Effect {
                    // effect_id: data.effect_id,
                    colors: vec![
                        [color.r, color.g, color.b, data.alpha];
                        led_parts.get(&data.part_name).unwrap().get_len() as usize
                    ],
                },
            );
        }
    }

    // let effect_data: HashMap<i32, Effect> =
    //     HashMap::from_iter(effect_state_data.iter().map(|data| {
    //         (
    //             data.id,
    //             Effect {
    //                 effect_id: data.effect_id,
    //                 position: data.position,
    //                 alpha: data.alpha,
    //                 colo_id: data.color_id,
    //             },
    //         )
    //     }));

    // ((frame_id, part_id), color[]
    let mut led_data: HashMap<(i32, i32), &Vec<[i32; 4]>> = HashMap::new();

    let led_effect_data = sqlx::query!(
        r#"
            SELECT
                ControlData.id as "control_data_id", 
                ControlData.part_id,
                ControlData.frame_id,
                ControlData.effect_id
            FROM Dancer
            INNER JOIN Model
                ON Dancer.model_id = Model.id
            INNER JOIN Part
                ON Model.id = Part.model_id
            INNER JOIN ControlData
                ON Part.id = ControlData.part_id AND
                ControlData.dancer_id = Dancer.id
            WHERE Dancer.id = ? AND
                Part.type = 'LED' AND
                ControlData.type = 'EFFECT'
            ORDER BY ControlData.id;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    // TODO: don't use unwrap down there
    for data in led_effect_data {
        led_data.insert(
            (data.frame_id, data.part_id),
            &effects
                .get(&data.effect_id.unwrap())
                .ok_or("effect not found")
                .into_result()?
                .colors,
        );
    }

    // ((frame_id, part_id), color[])
    let mut led_bulb: HashMap<(i32, i32), Vec<[i32; 4]>> = HashMap::new();

    let bulb_data = sqlx::query!(
        r#"
            SELECT
                ControlData.id as "control_data_id", 
                ControlFrame.id as "frame_id",
                Part.id as "part_id",
                Part.name as "part_name",
                LEDBulb.position,
                LEDBulb.color_id,
                LEDBulb.alpha
            FROM Dancer
            INNER JOIN Model
                ON Dancer.model_id = Model.id
            INNER JOIN Part
                ON Model.id = Part.model_id
            INNER JOIN ControlData
                ON Part.id = ControlData.part_id AND
                ControlData.dancer_id = Dancer.id
            INNER JOIN LEDBulb
                ON LEDBulb.control_id = ControlData.id
            INNER JOIN ControlFrame
                ON ControlData.frame_id = ControlFrame.id
            WHERE Dancer.id = ? AND Part.type = 'LED'
            ORDER BY ControlData.id, LEDBulb.position;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    // TODO: fix super super dirty code
    for data in bulb_data {
        let color = colors
            .get(&data.color_id)
            .unwrap_or(&Color { r: 0, g: 0, b: 0 });

        if let Some(bulb) = led_bulb.get_mut(&(data.frame_id, data.part_id)) {
            let color_value = bulb
                .get_mut(data.position as usize)
                .ok_or("LED position out of bounds")
                .into_result()?;

            *color_value = [color.r, color.g, color.b, data.alpha];
        } else {
            led_bulb.insert(
                (data.frame_id, data.part_id),
                vec![
                    [color.r, color.g, color.b, data.alpha];
                    led_parts.get(&data.part_name).unwrap().get_len() as usize
                ],
            );
        }
    }

    led_bulb.iter_mut().for_each(|(_, vec)| {
        let segments = gradient_to_rgb_float((*vec).clone());
        let status = interpolate_gradient(segments);

        *vec = status;
    });

    led_bulb.iter().for_each(|((frame_id, part_id), v)| {
        led_data.insert((*frame_id, *part_id), v);
    });

    let control_frames = sqlx::query!(
        r#"
            SELECT
                ControlFrame.id,
                ControlFrame.start,
                ControlFrame.fade,
                ControlData.type,
                ControlData.part_id
            FROM Dancer
            INNER JOIN Model
                ON Dancer.model_id = Model.id
            INNER JOIN Part
                ON Model.id = Part.model_id
            INNER JOIN ControlData
                ON Part.id = ControlData.part_id AND
                ControlData.dancer_id = Dancer.id
            INNER JOIN ControlFrame
                ON ControlData.frame_id = ControlFrame.id
            WHERE Dancer.id = ?
            ORDER BY ControlFrame.start;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let control_frames = partition_by_field(|cf| cf.start, control_frames);

    let mut frames: Vec<FrameData> = Vec::new();

    for frame in control_frames {
        let frame_id = frame[0].id;
        let start_time = frame[0].start as u32;
        let fade = frame[0].fade as u8;

        let mut is_no_effect: HashMap<i32, bool> = HashMap::new();

        for control_data in frame {
            is_no_effect.insert(control_data.id, control_data.r#type == "NO_EFFECT");
        }

        let checksum = 0;

        let mut of: HashMap<i32, [i32; 3]> = HashMap::new();

        for of_part_id in of_parts.values() {
            let color = if *is_no_effect.get(of_part_id).unwrap() {
                *frames
                    .last()
                    .ok_or("first frame can't be no effect")
                    .into_result()?
                    .of_grb_data
                    .get(of_part_id)
                    .unwrap()
            } else {
                alpha(
                    of_data
                        .get(&(frame_id, *of_part_id))
                        .unwrap_or(&[0, 0, 0, 0]),
                )
            };

            of.insert(frame_id, color);
        }

        let mut led: HashMap<i32, Vec<[i32; 3]>> = HashMap::new();

        for led_part in led_parts.values() {
            let color = if *is_no_effect.get(&led_part.get_id()).unwrap() {
                frames
                    .last()
                    .ok_or("first frame can't be no effect")
                    .into_result()?
                    .led_grb_data
                    .get(&led_part.get_id())
                    .unwrap()
                    .clone()
            } else {
                led_data
                    .get(&(frame_id, led_part.get_id()))
                    .unwrap_or(&&vec![[0, 0, 0, 0]; led_part.get_len() as usize])
                    .iter()
                    .map(alpha)
                    .collect_vec()
            };

            led.insert(led_part.get_id(), color);
        }

        let frame_data = FrameData {
            // id: frame_id,
            start_time,
            of_grb_data: of,
            led_grb_data: led,
            fade,
            checksum,
        };

        frames.push(frame_data);
    }

    for frame in frames {
        write_little_endian(&frame.start_time, &mut response);
        response.push(frame.fade);
        for of_part_id in of_parts.values() {
            let color = frame.of_grb_data.get(of_part_id).unwrap();
            response.push(color[1] as u8);
            response.push(color[0] as u8);
            response.push(color[2] as u8);
        }

        for led_part in led_parts.values() {
            let colors = frame.led_grb_data.get(&led_part.get_id()).unwrap();
            colors.iter().for_each(|color| {
                response.push(color[1] as u8);
                response.push(color[0] as u8);
                response.push(color[2] as u8);
            });
        }

        write_little_endian(&frame.checksum, &mut response);
    }

    let mut headers = HeaderMap::new();
    headers.insert("content-type", HeaderValue::from_static("application/json"));

    Ok((StatusCode::OK, (headers, Json(response))))
}
