import sys
from typing import List
from termcolor import colored
from board import display_board_with_values, display_full_board, display_board_with_resources
from config import resources_map, dice_probability, indexes, tile_images_path
import click
from image_service import crop_image
from openai_service import parse_img

def setup_resources() -> List[str]:
    resources = input("Enter resources: (Wood, Brick, Ore, Sheep, Wheat, Robber)\n(ex: o,r,wo,w,b,wo,b,w,s,b,s,s,wo,o,wo,w,o,w,s)\n->").strip()
    resources = resources.split(",")

    # Check input
    if len(resources) != 19:
        print("Invalid resources number. Expected 19, got {}".format(len(resources)))
        return None
    for resource in resources:
        if resource not in resources_map.keys():
            print("Invalid resource {}. Must be in o,r,wo,w,b,s".format(resource))
            return None

    return resources


def setup_values() -> List[str]:
    values = input("Enter values: (0 for the robber)\n(ex: 2,0,5,6,9,10,8,3,4,11,3,4,8,5,6,11,10,9,12)\n->").strip()
    values = values.split(",")

    # Check input
    if len(values) != 19:
        print("Invalid values number. Expected 19, got {}".format(len(values)))
        return None

    return values

def play(resources: List[str], values: List[str]):
    settlements = ""

    while True:
        # Input new settlements positions
        new_settlement = input("Enter your settlements positions: ").strip()

        if new_settlement == ".":
            for key, value in dice_probability.items():
                if key == 0:
                    continue
                print("[{}]:\t{}\t{}/36\t{}%".format(
                    colored(key, value[2]),
                    round(value[0], 3),
                    value[1],
                    int(value[1] * 100 / 36)
                ))
            continue

        settlements += new_settlement
        display_full_board(resources, values, settlements)

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

@click.command()
@click.option('--file', type=click.Path(), default=None, help='Path to the input file (optional)')
def main(file):
    if file:
        crop_image(file)
        # sys.exit(0)
        resources = []
        values = []
        board_color_map = {v["board_color"]: k for k, v in resources_map.items()}

        for i in range(19):
            tile = parse_img(f"{tile_images_path}/tile_{i+1}.png")
            resources.append(board_color_map[tile['color']])
            values.append(tile['value'])
        display_board_with_values(resources, values)
    else:
        resources = setup_resources()
        if not resources:
            sys.exit(1)
        display_board_with_resources(resources)

        values = setup_values()
        if not values:
            sys.exit(1)
        display_board_with_values(resources, values)

    play(resources, values)

if __name__ == "__main__":
    main()