import json, sys

input_path = sys.argv[1]
output_path = sys.argv[2]
with open(input_path) as f:
    old_data = json.load(f)
    old_color = old_data["color"]
    color = {k:[int(v[1:3], 16), int(v[3:5], 16), int(v[5:7], 16)] for k, v in old_color.items()}
    new_data = old_data
    new_data["color"] = color
    
with open(output_path, "w") as f:
    json.dump(new_data, f)

