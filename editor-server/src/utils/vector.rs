//! Utility functions for vectors.

use itertools::Itertools;

pub fn partition_by_field<T, F, V>(get_field: F, vec: Vec<V>) -> Vec<Vec<V>>
where
    F: Fn(&V) -> T,
    T: PartialEq,
{
    if vec.is_empty() {
        return Vec::new();
    }

    let mut result = vec![Vec::new()];
    let mut current_field = None;

    let fields = vec.iter().map(get_field).collect_vec();

    vec.into_iter().zip(fields.iter()).for_each(|(v, f)| {
        if let Some(cf) = current_field {
            if cf != f {
                result.push(Vec::new());
            }
        }
        current_field = Some(f);
        if let Some(current) = result.last_mut() {
            current.push(v);
        }
    });

    result
}
