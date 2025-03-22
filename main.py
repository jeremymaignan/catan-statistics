import sys
from typing import List

import click

from board import display_board_with_resources, display_board_with_values
from config import resources_map, tile_images_path
from game import play
from services.image import crop_image
from services.openai import parse_image_data


def setup_resources() -> List[str]:
    resources = input(
        "Enter resources: (Wood, Brick, Ore, Sheep, Wheat, Robber)\n(ex: o,r,wo,w,b,wo,b,w,s,b,s,s,wo,o,wo,w,o,w,s)\n->"
    ).strip()
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
    values = input(
        "Enter values: (0 for the robber)\n(ex: 2,0,5,6,9,10,8,3,4,11,3,4,8,5,6,11,10,9,12)\n->"
    ).strip()
    values = values.split(",")

    # Check input
    if len(values) != 19:
        print("Invalid values number. Expected 19, got {}".format(len(values)))
        return None

    return values


@click.command()
@click.option(
    "--file", type=click.Path(), default=None, help="Path to the input file (optional)"
)
def main(file):
    if file:
        crop_image(file)
        # sys.exit(0)
        resources = []
        values = []
        board_color_map = {v["board_color"]: k for k, v in resources_map.items()}

        for i in range(19):
            tile = parse_image_data(f"{tile_images_path}/tile_{i+1}.png")
            resources.append(board_color_map[tile["color"]])
            values.append(tile["value"])
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
