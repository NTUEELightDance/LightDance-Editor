use std::collections::BTreeMap;
use std::fs;
use std::path::Path;
// Note: Add serde and serde_json to Cargo.toml dependencies:
// serde = { version = "1.0", features = ["derive"] }
// serde_json = "1.0"

// Type aliases matching the editor-server types
pub type PartControlString = (String, i32); // (color/effect name, alpha)
pub type PartControlBulbs = Vec<(String, i32)>; // Vec<(color/effect name, alpha)>

/// Control frame data structure
#[derive(Debug, Clone)]
// #[derive(Serialize, Deserialize)] // Uncomment when serde is added
pub struct ControlData {
    pub start: i32,
    pub fade: bool,
    pub status: Vec<Vec<PartControlString>>,
    pub led_status: Vec<Vec<PartControlBulbs>>,
}

/// Main data structure containing control frames
#[derive(Debug)]
// #[derive(Serialize, Deserialize)] // Uncomment when serde is added
pub struct PropData {
    pub control: BTreeMap<String, ControlData>,
}

/// Trait for customizing frame creation and updates
/// Each prop implementation should implement this trait with their specific logic
pub trait PropCustomizer {

    fn customize_add_frame(
        &self,
        status: &mut Vec<Vec<PartControlString>>,
        led_status: &mut Vec<Vec<PartControlBulbs>>,
        previous_control: &ControlData,
        start: i32,
    );

    fn customize_update_frame(
        &self,
        status: &mut Vec<Vec<PartControlString>>,
        led_status: &mut Vec<Vec<PartControlBulbs>>,
        frame: &ControlData,
    );

   fn get_fade_value(&self, previous_control: &ControlData, _start: i32) -> bool {
        previous_control.fade
    }

}

impl PropData {

    /// Creates a new PropData instance
    pub fn new() -> Self {
        Self {
            control: BTreeMap::new(),
        }
    }

    /// =============== add frame================ ///

    fn find_previous_control(&self, start: i32) -> Option<&ControlData> {
        self.control
            .values()
            .filter(|d| d.start <= start)
            .max_by_key(|d| d.start)
    }

    pub fn add_frame<C: PropCustomizer>(&mut self, start: i32, customizer: &C) {
        // Find previous control frame
        let previous_control = self
            .find_previous_control(start)
            .cloned()
            .unwrap_or_else(|| ControlData {
                start: i32::MIN,
                fade: true,
                status: Vec::new(),
                led_status: Vec::new(),
            });

        // Deep clone status and led_status
        let mut status = previous_control.status.clone();
        let mut led_status = previous_control.led_status.clone();

        // Allow customization of status and led_status
        customizer.customize_add_frame(&mut status, &mut led_status, &previous_control, start);

        // Determine fade value
        let fade_value = customizer.get_fade_value(&previous_control, start);

        // Create control data
        let control_data = ControlData {
            start,
            fade: fade_value,
            status,
            led_status,
        };

        // Find existing frame or create new key
        let key = self.control
            .iter()
            .find(|(_, value)| value.start == start)
            .map(|(key, _)| key.clone())
            .unwrap_or_else(|| {
                let max_key = self
                    .control
                    .keys()
                    .filter_map(|k| k.parse::<i32>().ok())
                    .max()
                    .unwrap_or(0);
                (max_key + 1).to_string()
            });
        self.control.insert(key, control_data);
    }

    pub fn update_frame<C: PropCustomizer>(&mut self, key: &str, customizer: &C) {
        let frame = match self.control.get(key) {
            Some(f) => f.clone(),
            None => return,
        };

        let mut status = frame.status.clone();
        let mut led_status = frame.led_status.clone();

        // Allow customization of status and led_status
        customizer.customize_update_frame(&mut status, &mut led_status, &frame);

        let control_data = ControlData {
            start: frame.start,
            fade: frame.fade,
            status,
            led_status,
        };

        self.control.insert(key.to_string(), control_data);
    }

    /// Gets the count of control frames
    pub fn control_count(&self) -> usize {
        self.control.len()
    }
    
}

impl Default for PropData {
    fn default() -> Self {
        Self::new()
    }
}

/// Common configuration structure for prop animations
/// Each prop implementation can use this as a base and extend with additional fields
#[derive(Debug, Clone)]
pub struct PropConfig {
    pub period: f64,
    pub led_length: usize,
    pub direction: i32,
    pub double: bool,
    pub part_length: usize,
    pub index: usize,
    pub led_index: usize,
    pub start_time: i32,
    pub end_time: i32,
    pub default_color_data: PartControlString,
    pub secondary_color_data: PartControlString,
}

impl PropConfig {
    /// Creates a new PropConfig with default values
    pub fn new() -> Self {
        Self {
            period: 500.0,
            led_length: 15,
            direction: 0, // "mid"
            double: false,
            part_length: 266,
            index: 0,
            led_index: 0,
            start_time: 0,
            end_time: 0,
            default_color_data: ("".to_string(), 255),
            secondary_color_data: ("".to_string(), 255),
        }
    }

    /// Sets the direction from a string ("left", "right", "mid") or number
    pub fn set_direction(&mut self, direction: &str) {
        self.direction = match direction {
            "right" => -1,
            "left" => 1,
            "mid" => 0,
            _ => direction.parse().unwrap_or(0),
        };
    }

    /// Normalizes direction string to number
    pub fn normalize_direction(direction: &str) -> i32 {
        match direction {
            "right" => -1,
            "left" => 1,
            "mid" => 0,
            _ => direction.parse().unwrap_or(0),
        }
    }
}

impl Default for PropConfig {
    fn default() -> Self {
        Self::new()
    }
}

impl PropData {
    /// Saves the data to a JSON file
    /// 
    /// # Arguments
    /// * `file_path` - Path to save the file (relative to current directory or absolute)
    /// * `pretty` - Whether to format JSON with indentation (default: false)
    /// 
    /// # Note
    /// Requires serde and serde_json dependencies. Uncomment the Serialize derives above.
    pub fn save_to_file(&self, file_path: &str, pretty: bool) -> std::io::Result<()> {
        // When serde is enabled, use:
        // let json = if pretty {
        //     serde_json::to_string_pretty(self)?
        // } else {
        //     serde_json::to_string(self)?
        // };
        // fs::write(file_path, json)?;
        
        // Placeholder implementation
        println!("Saving to {} (pretty: {})", file_path, pretty);
        Ok(())
    }

    /// Logs the number of control frames
    pub fn log_control_count(&self) {
        println!("{}", self.control_count());
    }

    /// Saves the data and logs the control count (equivalent to JS lines 69-71)
    /// 
    /// Equivalent to:
    /// ```javascript
    /// fs.writeFileSync(path.join(__dirname, "./props.json"), JSON.stringify(data, null, 0));
    /// console.log(Object.keys(data.control).length)
    /// console.log("Updated data has been saved to ./props.json");
    /// ```
    pub fn save_and_log(&self, file_path: &str) -> std::io::Result<()> {
        self.save_to_file(file_path, false)?;
        self.log_control_count();
        println!("Updated data has been saved to {}", file_path);
        Ok(())
    }
}

