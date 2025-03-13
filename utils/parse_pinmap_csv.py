import csv
import json
import os
import re
import sys

"""
Usage: python parse_pinmap_csv.py <csv_file> <ts_file>
Purpose: Convert a csv pinmap table to a typescript object
Input: csv_file - the csv file containing the pinmap table
       ts_file - the typescript file to output the pinmap object
Note: Only the LED parts are considered as no fibers are used in 2025 props.

The csv file should be in the following format:

model_1
part_1, 1, 10
part_2, 2, 20
part_3, 3, 30
model_2
part_1, 1, 10
part_2, 2, 20
part_3, 3, 30
...
"""


def csv_to_ts_json(csv_file, ts_file):
    dancers = {}
    current_dancer = None

    with open(csv_file, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            if not row[2]:
                current_dancer = row[0].strip()
                dancers[current_dancer.lower()] = {
                    "fps": 30,
                    "OFPARTS": {},
                    "LEDPARTS": {},
                    "LEDPARTS_MERGE": {},
                }
            else:
                part_name, part_id, part_length = row
                if current_dancer:
                    dancers[current_dancer.lower()]["LEDPARTS"][part_name] = {
                        "id": int(part_id),
                        "len": int(part_length),
                    }

    with open(ts_file, "w", encoding="utf-8", newline=os.linesep) as f:
        content = (
            'import { ModelPinMapTable } from "@/schema/PinMapTable";\n\n'
            "export const PropPinMapTable: ModelPinMapTable = "
            + json.dumps(dancers, ensure_ascii=False, indent=2)
        )
        content = re.sub(r"\"(\w+)\":", r"\1:", content)
        f.write(content)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python parse_pinmap_csv.py <csv_file> <ts_file>")
        sys.exit(1)
    csv_file, ts_file = sys.argv[1], sys.argv[2]
    if not os.path.exists(csv_file):
        print(f"File {ts_file} already exists, please remove it first")
        sys.exit(1)
    csv_to_ts_json(csv_file, ts_file)
    print("Converted csv to ts successfully")
