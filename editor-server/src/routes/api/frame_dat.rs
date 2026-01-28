use std::collections::{HashMap, HashSet};

use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Json,
};
use itertools::Itertools;

use crate::{global, utils::vector::partition_by_field};

use super::{
    types::{GetControlDatQuery, GetDataFailedResponse},
    utils::{alpha, gradient_to_rgb_float, interpolate_gradient, write_little_endian, IntoResult},
};

type GetDataResponse = Vec<u8>;
type Color = [i32; 3];
type LEDStatus = [i32; 4];

const VERSION: [u8; 2] = [0, 0];
const DEFAULT_COLOR: Color = [0, 0, 0];

#[derive(Debug)]
struct Effect {
    // effect_id: i32,
    status: Vec<[i32; 4]>,
}

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
    let color_map: HashMap<i32, Color> = HashMap::from_iter(
        colors
            .iter()
            .map(|color| (color.id, [color.r, color.g, color.b])),
    );

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
            WHERE Dancer.id = ? AND
                Part.type = 'FIBER' AND
                ControlData.type != 'NO_EFFECT'
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
    let of_data_map: HashMap<(i32, i32), LEDStatus> =
        HashMap::from_iter(of_data.iter().map(|data| {
            let color = match data.color_id {
                Some(id) => color_map.get(&id).unwrap_or(&[0, 0, 0]),
                None => &[0, 0, 0],
            };

            (
                (data.contorl_frame_id, data.part_id),
                [color[0], color[0], color[0], data.alpha.unwrap()],
            )
        }));

    // (id, color[])
    let mut effects_map: HashMap<i32, Effect> = HashMap::new();

    let effect_data = sqlx::query!(
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

    let effect_data = partition_by_field(|data| data.effect_id, effect_data);

    for effect in effect_data {
        let effect_id = effect[0].effect_id;
        let effect_status = Vec::from_iter(effect.into_iter().map(|data| {
            let color = color_map.get(&data.color_id).unwrap_or(&DEFAULT_COLOR);
            [color[0], color[1], color[2], data.alpha]
        }));

        effects_map.insert(
            effect_id,
            Effect {
                status: effect_status,
            },
        );
    }

    // TODO: fix super super dirty code
    // for data in effect_state_data {
    //     if let Some(effect) = effects_map.get_mut(&data.effect_id) {
    //         let color_value = effect
    //             .colors
    //             .get_mut(data.position as usize)
    //             .ok_or("LED position out of bounds")
    //             .into_result()?;
    //
    //         let color = color_map.get(&data.color_id).unwrap_or(&DEFAULT_COLOR);
    //
    //         *color_value = [color[0], color[0], color[0], data.alpha];
    //     } else {
    //         let color = color_map.get(&data.color_id).unwrap_or(&DEFAULT_COLOR);
    //         effects_map.insert(
    //             data.effect_id,
    //             Effect {
    //                 // effect_id: data.effect_id,
    //                 colors: vec![
    //                     [color[0], color[1], color[2], data.alpha];
    //                     led_parts.get(&data.part_name).unwrap().get_len() as usize
    //                 ],
    //             },
    //         );
    //     }
    // }

    // ((frame_id, part_id), color[]
    let mut led_data: HashMap<(i32, i32), &Vec<LEDStatus>> = HashMap::new();

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
            &effects_map
                .get(&data.effect_id.unwrap())
                .ok_or("effect not found")
                .into_result()?
                .status,
        );
    }

    // ((frame_id, part_id), color[])
    let mut led_bulb_data_map: HashMap<(i32, i32), Vec<LEDStatus>> = HashMap::new();

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
            ORDER BY ControlData.id ASC, LEDBulb.position ASC;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let bulb_data = partition_by_field(|data| data.control_data_id, bulb_data);

    for data in bulb_data {
        let frame_id = data[0].frame_id;
        let part_id = data[0].part_id;

        let bulb_status: Vec<LEDStatus> = Vec::from_iter(data.into_iter().map(|bulb| {
            let color = color_map.get(&bulb.color_id).unwrap_or(&DEFAULT_COLOR);
            [color[0], color[1], color[2], bulb.alpha]
        }));

        led_bulb_data_map.insert((frame_id, part_id), bulb_status);
    }

    // TODO: fix super super dirty code
    // for data in bulb_data {
    //     let color = color_map.get(&data.color_id).unwrap_or(&[0, 0, 0]);
    //
    //     if let Some(bulb) = led_bulb.get_mut(&(data.frame_id, data.part_id)) {
    //         let color_value = bulb
    //             .get_mut(data.position as usize)
    //             .ok_or("LED position out of bounds")
    //             .into_result()?;
    //
    //         *color_value = [color[0], color[1], color[2], data.alpha];
    //     } else {
    //         led_bulb.insert(
    //             (data.frame_id, data.part_id),
    //             vec![
    //                 [color[0], color[1], color[2], data.alpha];
    //                 led_parts.get(&data.part_name).unwrap().get_len() as usize
    //             ],
    //         );
    //     }
    // }

    led_bulb_data_map.iter_mut().for_each(|(_, vec)| {
        let segments = gradient_to_rgb_float((*vec).clone());
        let status = interpolate_gradient(segments);

        *vec = status;
    });

    led_bulb_data_map
        .iter()
        .for_each(|((frame_id, part_id), v)| {
            led_data.insert((*frame_id, *part_id), v);
        });

    let control_frames = sqlx::query!(
        r#"
            SELECT
                ControlFrame.id,
                ControlFrame.start,
                ControlData.type,
                ControlData.part_id,
                ControlData.fade
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
        let mut checksum: u32 = 0;
        let fade: u8 = match frame[0].fade {
            Some(f) => f as u8,
            None => {
                frames
                    .last()
                    .ok_or("first frame can't be no effect")
                    .into_result()?
                    .fade
            }
        };

        checksum += fade as u32;

        let mut no_effect: HashSet<i32> = HashSet::new();

        for control_data in frame {
            if control_data.r#type == "NO_EFFECT" {
                no_effect.insert(control_data.id);
            }
        }

        // (part_id, color)
        let mut of: HashMap<i32, Color> = HashMap::new();

        for of_part_id in of_parts.values() {
            let color = if no_effect.contains(of_part_id) {
                *frames
                    .last()
                    .ok_or("first frame can't be no effect")
                    .into_result()?
                    .of_grb_data
                    .get(of_part_id)
                    .unwrap()
            } else {
                alpha(
                    of_data_map
                        .get(&(frame_id, *of_part_id))
                        .unwrap_or(&[0, 0, 0, 0]),
                )
            };

            of.insert(*of_part_id, color);

            checksum += color[0] as u32;
            checksum += color[1] as u32;
            checksum += color[2] as u32;
        }

        let mut led: HashMap<i32, Vec<Color>> = HashMap::new();

        for led_part in led_parts.values() {
            let color = if no_effect.contains(&led_part.get_id()) {
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

            color.iter().for_each(|c| {
                checksum += c[0] as u32;
                checksum += c[1] as u32;
                checksum += c[2] as u32;
            });

            led.insert(led_part.get_id(), color);
        }

        checksum += start_time.to_le_bytes().iter().sum::<u8>() as u32;

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
