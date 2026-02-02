pub trait IntoResult<T, E> {
    fn into_result(self) -> Result<T, E>;
}

pub fn write_little_endian(num: &u32, v: &mut Vec<u8>) {
    num.to_le_bytes().iter().for_each(|n| v.push(*n));
}

pub fn interpolate_gradient(segments: Vec<Vec<[i32; 4]>>) -> Vec<[i32; 4]> {
    let mut interpolated_status: Vec<[i32; 4]> = vec![];

    for segment in segments.clone() {
        if segment.len() < 2 {
            interpolated_status.extend_from_slice(&segment);
            continue;
        }
        if segment[0][0] == -1 {
            if segment.last().unwrap()[0] == -1 {
                for _ in 0..segment.len() {
                    interpolated_status.push([0, 0, 0, 0]);
                }
                continue;
            }
            for i in 1..segment.len() {
                let start_bulb = segments.last().unwrap()[0];
                let end_bulb = segment[segment.len() - 1];

                let r: i32 = start_bulb[0]
                    + (end_bulb[0] - start_bulb[0])
                        * (i + segments.last().unwrap().len() - 1) as i32
                        / (segment.len() + segments.last().unwrap().len() - 1) as i32;
                let g: i32 = start_bulb[1]
                    + (end_bulb[1] - start_bulb[1])
                        * (i + segments.last().unwrap().len() - 1) as i32
                        / (segment.len() + segments.last().unwrap().len() - 1) as i32;
                let b: i32 = start_bulb[2]
                    + (end_bulb[2] - start_bulb[2])
                        * (i + segments.last().unwrap().len() - 1) as i32
                        / (segment.len() + segments.last().unwrap().len() - 1) as i32;
                let alpha: i32 = start_bulb[3]
                    + (end_bulb[3] - start_bulb[3])
                        * (i + segments.last().unwrap().len() - 1) as i32
                        / (segment.len() + segments.last().unwrap().len() - 1) as i32;

                interpolated_status.push([r, g, b, alpha]);
            }
            continue;
        } else if segment.last().unwrap()[0] == -1 {
            for i in 1..segment.len() {
                let start_bulb = segment[0];
                let end_bulb = segments[0].last().unwrap();

                let r: i32 = start_bulb[0]
                    + (end_bulb[0] - start_bulb[0]) * i as i32
                        / (segment.len() + segments[0].len() - 1) as i32;
                let g: i32 = start_bulb[1]
                    + (end_bulb[1] - start_bulb[1]) * i as i32
                        / (segment.len() + segments[0].len() - 1) as i32;
                let b: i32 = start_bulb[2]
                    + (end_bulb[2] - start_bulb[2]) * i as i32
                        / (segment.len() + segments[0].len() - 1) as i32;
                let alpha: i32 = start_bulb[3]
                    + (end_bulb[3] - start_bulb[3]) * i as i32
                        / (segment.len() + segments[0].len() - 1) as i32;

                interpolated_status.push([r, g, b, alpha]);
            }
            continue;
        }

        let start_bulb = segment[0];
        let end_bulb = segment[segment.len() - 1];

        for (i, _color) in segment.iter().enumerate() {
            if i == 0 || i == segment.len() - 1 {
                continue;
            }

            let r: i32 = start_bulb[0]
                + (end_bulb[0] - start_bulb[0]) * i as i32 / (segment.len() - 1) as i32;
            let g: i32 = start_bulb[1]
                + (end_bulb[1] - start_bulb[1]) * i as i32 / (segment.len() - 1) as i32;
            let b: i32 = start_bulb[2]
                + (end_bulb[2] - start_bulb[2]) * i as i32 / (segment.len() - 1) as i32;
            let alpha: i32 = start_bulb[3]
                + (end_bulb[3] - start_bulb[3]) * i as i32 / (segment.len() - 1) as i32;

            interpolated_status.push([r, g, b, alpha]);
        }
    }

    interpolated_status
}

pub fn gradient_to_rgb_float(status: Vec<[i32; 4]>) -> Vec<Vec<[i32; 4]>> {
    let mut segments: Vec<Vec<[i32; 4]>> = vec![];
    let mut head = 0;

    for (i, bulb_status) in status.iter().enumerate() {
        if bulb_status[0] == -1 && i != status.len() - 1 {
            continue;
        } else if (i != 0 && status[i - 1][0] == -1) || i == status.len() - 1 {
            segments.push(status[head..i + 1].to_vec());
            head = i;
        }
        if bulb_status[0] != -1 {
            segments.push(vec![*bulb_status]);
            head = i;
        }
    }

    segments
}

pub fn alpha(status: &[i32; 4]) -> [i32; 3] {
    [
        (status[0] * status[3]),
        (status[1] * status[3]),
        (status[2] * status[3]),
    ]
}
