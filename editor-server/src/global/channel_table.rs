// TODO: find a better way to do this?
use std::collections::HashMap;
use std::sync::OnceLock;

static CHANNEL_MAP: OnceLock<HashMap<String, i32>> = OnceLock::new();

pub struct ChannelTable;

impl ChannelTable {
    pub fn init() {
        let part_name = vec![
            "cloak_out",
            "cloak_arm_left",
            "arm_left_out",
            "arm_left_in",
            "arm_cuff_left",
            "shirt_left_out",
            "shirt_left_mid",
            "shirt_left_in",
            "belt_left",
            "cloak_left_in",
            "cross",
            "cloak_arm_right",
            "arm_right_out",
            "arm_right_in",
            "arm_cuff_right",
            "shirt_right_out",
            "shirt_right_mid",
            "shirt_right_in",
            "belt_right",
            "cloak_right_in",
            "skirt_bottom_bottom",
            "skirt_left_out",
            "skirt_left_mid",
            "skirt_left_in",
            "leg_left_out",
            "leg_left_in",
            "shoes_left_bottom",
            "shoes_left_ankle",
            "shoes_left_front",
            "skirt_bottom_top",
            "skirt_right_out",
            "skirt_right_mid",
            "skirt_right_in",
            "leg_right_out",
            "leg_right_in",
            "shoes_right_bottom",
            "shoes_right_ankle",
            "shoes_right_front",
            "mask_LED",
            "glove_left_LED",
            "glove_right_LED",
            "shoes_left_LED",
            "hat_ring_LED",
            "hat_main_LED",
        ];

        let part_id = vec![
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 0, 1, 2, 3, 4, 5, 6,
        ];

        CHANNEL_MAP.get_or_init(|| {
            HashMap::from_iter(
                part_name
                    .into_iter()
                    .zip(part_id)
                    .map(|(name, id)| (name.to_string(), id)),
            )
        });
    }

    pub fn get_part_id(name: &String) -> Option<i32> {
        CHANNEL_MAP.get().unwrap().get(name).copied()
    }
}
