//! Utility functions for vectors.

pub fn partition_by_field<T, F>(field: &Vec<T>, vec: Vec<F>) -> Vec<Vec<F>>
where
    T: PartialEq + Copy,
{
    let mut result = vec![Vec::new()];
    let mut current_field = None;

    vec.into_iter().zip(field.iter()).for_each(|(v, f)| {
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
