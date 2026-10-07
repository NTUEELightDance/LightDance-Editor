import json

def add_dancers_to_existing_lighttable(newEmptyDataPath, oriLightTablePath, updatedLightTablePath):
    with open(newEmptyDataPath, 'r') as f:
        new_data = json.load(f)
    
    with open(oriLightTablePath, 'r') as f:
        ori_data = json.load(f)

    if (not new_data):
        print("newEmptyDataPath is empty")
        return

    if (not ori_data):
        print("oriLightTablePath is empty")
        return

    dancers = [dancer["name"] for dancer in ori_data['dancer']]
    added_dancers = []
    for dancer in new_data['dancer']:
        if dancer["name"] not in dancers:
            dancers.append(dancer["name"])
            added_dancers.append(dancer["name"])
    num_added_dancers = len(added_dancers)
    num_dancers = len(dancers)

    if num_added_dancers == 0:
        print("No new dancers")
        return
    
    print(added_dancers)
    print(dancers)

    #Update control map
    controlMap = ori_data["control"]
    for controlElements in controlMap.values():
        for field in controlElements.keys():
            if field == "status":
                status = controlElements[field]
                for dancer in added_dancers:
                    dancer_status = []
                    len_parts = len(new_data['dancer'][int(dancer[0])]["parts"])
                    for _ in range(len_parts):
                        dancer_status.append(["black", 255])
                    status.append(dancer_status)

            elif field == "led_status":
                led_status = controlElements[field]
                for dancer in added_dancers:
                    dancer_led_status = []
                    len_parts = len(new_data['dancer'][int(dancer[0])]["parts"])
                    for _ in range(len_parts):
                        dancer_led_status.append([])
                    led_status.append(dancer_led_status)

            elif field == "fade":
                fade = controlElements[field]
                for _ in range(num_added_dancers):
                    fade.append(False)

            elif field == "has_effect":
                has_effect = controlElements[field]
                for _ in range(num_added_dancers):
                    has_effect.append(True)

    #Update position map
    posMap = ori_data["position"]
    for posElements in posMap.values():
        for field in posElements.keys():
            if field == "location":
                location = posElements[field]
                for dancer in added_dancers:
                    index = int(dancer[0])
                    location.append([0, (index - (num_dancers - 1) / 2), 0])

            elif field == "rotation":
                rotation = posElements[field]
                for _ in added_dancers:
                    rotation.append([0, 0, 0])
                    
            elif field == "has_position":
                has_position = posElements[field]
                for _ in added_dancers:
                    has_position.append(True)

    #Update LED Effects
    led_effects = ori_data["LEDEffects"]
    added_models = []
    for dancer in ori_data["dancer"]:
        dancer_model = dancer["model"]
        if dancer_model not in added_models:
            added_models.append(dancer_model)
    print(added_models)

    for dancer in added_dancers:
        dancer_obj = new_data["dancer"][int(dancer[0])]
        dancer_model = dancer_obj["model"]
        if dancer_model not in added_models:
            print(f"Adding model {dancer_model}")
            model_led_effects = {}

            for part in dancer_obj["parts"]:
                if part["type"] == "LED":
                    part_led_effects = {}
                    for color in ori_data["color"].keys():
                        color_led_effects = {}

                        frames_led_effects = []

                        frame_led_effect = {}
                        frame_led_effect["LEDs"] = []
                        for _ in range(part["length"]):
                            frame_led_effect["LEDs"].append([color, 255])
                        frame_led_effect["start"] = 0
                        frame_led_effect["fade"] = False

                        frames_led_effects.append(frame_led_effect)

                        color_led_effects["repeat"] = 0
                        color_led_effects["frames"] = frames_led_effects
                        part_led_effects[color] = color_led_effects
                    model_led_effects[part["name"]] = part_led_effects

            led_effects[dancer_model] = model_led_effects
            added_models.append(dancer_model)
    print(added_models)

    #Update dancers
    #Done last because we need to compare ori_data["dancer"] and new_data["dancer"] to do operations
    ori_data["dancer"] = new_data["dancer"]
    


    with open(updatedLightTablePath, 'w') as f:
        json.dump(ori_data, f, indent=4)
    return
        

if __name__ == "__main__":
    newEmptyDataPath = "./jsons/exportData.json"
    oriLightTablePath = "./jsons/exportData0711_formatted.json"
    updatedLightTablePath = "./jsons/exportData0712_updated.json"
    add_dancers_to_existing_lighttable(newEmptyDataPath, oriLightTablePath, updatedLightTablePath)