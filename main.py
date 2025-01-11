import sys
from typing import List
from termcolor import colored
from maps import map_resouces, map_resources_and_values_and_angles
from config import resources_map, dice_probability, indexes, settlements_positions, settlements_icon

def setup_resources():
    resources = input("Enter resources: (Wood, Brick, Ore, Sheep, Wheat, Robber)\n(ex: o,r,wo,w,b,wo,b,w,s,b,s,s,wo,o,wo,w,o,w,s)\n->")
    resources = resources.split(",")

    # Check input
    if len(resources) != 19:
        print("Invalid resources number. Expected 19, got {}".format(len(resources)))
        return None
    for resource in resources:
        if resource not in resources_map.keys():
            print("Invalid resource {}. Must be in o,r,wo,w,b,s".format(resource))
            return None

    print(map_resouces.format(*[colored(resources_map[x]["text"],resources_map[x]["color"])  for x in resources]))

    return resources

def setup_values(resources: List[str]) -> List[str]:
    values = input("Enter values: (0 for the robber)\n(ex: 2,0,5,6,9,10,8,3,4,11,3,4,8,5,6,11,10,9,12)\n->")
    values = values.split(",")

    # Check input
    if len(values) != 19:
        print("Invalid values number. Expected 19, got {}".format(len(values)))
        return None

    # Display map
    formated_values = ["{} ".format(x) if int(x) <= 9 else x for x in values]
    colored_resources = [colored(resources_map[x]["text"], resources_map[x]["color"])  for x in resources]
    display = settlements_positions[:7] + colored_resources[:3] + formated_values[:3] + \
        settlements_positions[7:16] + colored_resources[3:7] + formated_values[3:7] + \
        settlements_positions[16:27] + colored_resources[7:12] + formated_values[7:12] + \
        settlements_positions[27:38] + colored_resources[12:16] + formated_values[12:16] + \
        settlements_positions[38:47] + colored_resources[16:19] + formated_values[16:19] + \
        settlements_positions[47:]
    print(map_resources_and_values_and_angles.format(*display))

    return values

def play(resources: List[str], values: List[str]):
    settlements = ""

    while True:
        # Input new settlements positions
        settlements += input("Enter your settlements positions: ")

        # Display current map
        settlements_position = [settlements_positions[i] if x not in settlements else settlements_icon for i, x in enumerate(indexes.keys())]
        formated_values = ["{} ".format(x) if int(x) <= 9 else x for x in values]
        colored_resources = [colored(resources_map[x]["text"],resources_map[x]["color"])  for x in resources]
        display = settlements_position[:7] + colored_resources[:3] + formated_values[:3] + \
            settlements_position[7:16] + colored_resources[3:7] + formated_values[3:7] + \
            settlements_position[16:27] + colored_resources[7:12] + formated_values[7:12] + \
            settlements_position[27:38] + colored_resources[12:16] + formated_values[12:16] + \
            settlements_position[38:47] + colored_resources[16:19] + formated_values[16:19] + \
            settlements_position[47:]
        print(map_resources_and_values_and_angles.format(*display))

        # List resources per dice value
        # Calculate probabilities per resource
        proba_per_dice_value = {}
        proba_per_resource = {}
        for position in settlements:
            for case in indexes[position]:
                value = int(values[case-1])
                if value == 0:
                    continue
                resource = resources_map[resources[case-1]]
                if value not in proba_per_dice_value:
                    proba_per_dice_value[value] = []
                proba_per_dice_value[value].append(colored(resource["text"].strip(), resource["color"]))

                if resources[case-1] not in proba_per_resource:
                    proba_per_resource[resources[case-1]] = {
                        "rate": 0,
                        "proba": 0.0,
                        "values": set()
                    }
                if value not in proba_per_resource[resources[case-1]]["values"]:
                    proba_per_resource[resources[case-1]]["values"].add(value)
                    proba_per_resource[resources[case-1]]["proba"] += dice_probability[value][0]
                    proba_per_resource[resources[case-1]]["rate"] += dice_probability[value][1]

        any_resource = {
            "rate": 0,
            "proba": 0.0,
            "values": set()
        }
        for value in proba_per_dice_value.keys():
            any_resource["proba"] +=  dice_probability[value][0]
            any_resource["rate"] +=  dice_probability[value][1]

        # Display resource to receive per dice value
        for value in sorted(proba_per_dice_value.keys()):
            print("[{}]\t{}".format(value, ", ".join(proba_per_dice_value[value])))
        print("")

        # Display probability to receive each resources
        for resource, probas in dict(sorted(proba_per_resource.items(), key=lambda item: item[1]["rate"], reverse=True)).items():
            print("{}:\t{}\t{}/36\t{}%".format(
                colored(resources_map[resource]["text"].strip(),resources_map[resource]["color"]),
                round(probas["proba"], 3),
                probas["rate"],
                int(probas["rate"] * 100 / 36)
            ))

        # Display probability to receive any resource
        print("Any:\t{}\t{}/36\t{}%".format(
                round(any_resource["proba"], 3),
                any_resource["rate"],
                int(any_resource["rate"] * 100 / 36)
            ))
        print("")
        print("Your settlements: {}".format(settlements))

if __name__ == "__main__":
    resources = setup_resources()
    if not resources:
        sys.exit(1)
    values = setup_values(resources)
    if not values:
        sys.exit(1)
    play(resources, values)
