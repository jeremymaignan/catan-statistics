from typing import List, Optional, Tuple

import click
from termcolor import colored

from board import display_board_with_resources, display_board_with_values
from config import resources_map, tile_images_path
from game import play
from services.image import crop_image
from services.openai import OpenAIClient


def setup_resources() -> Optional[List[str]]:
    raw_input = input(
        "Enter resources (Wood, Brick, Ore, Sheep, Wheat, Robber):\n"
        "Example: o,r,wo,w,b,wo,b,w,s,b,s,s,wo,o,wo,w,o,w,s\n-> "
    ).strip()
    resources = [
        r.strip().lower() for r in raw_input.replace("'", "").split(",") if r.strip()
    ]

    # Check input
    if len(resources) != 19:
        print("Invalid resources number. Expected 19, got {}".format(len(resources)))
        return None
    for resource in resources:
        if resource not in resources_map.keys():
            print("Invalid resource {}. Must be in o,r,wo,w,b,s".format(resource))
            return None

    return resources


def setup_values() -> Optional[List[str]]:
    raw_input = input(
        "Enter values (0 for the robber):\n"
        "Example: 2,0,5,6,9,10,8,3,4,11,3,4,8,5,6,11,10,9,12\n-> "
    ).strip()
    values = [v for v in raw_input.replace("'", "").split(",") if v.strip()]

    # Check input
    if len(values) != 19:
        print("Invalid values number. Expected 19, got {}".format(len(values)))
        return None

    return values


def manual_setup() -> Tuple[List[str], List[str]]:
    resources = setup_resources()
    if not resources:
        return [], []
    display_board_with_resources(resources)

    values = setup_values()
    if not values:
        return [], []
    display_board_with_values(resources, values)
    return resources, values


def automatic_setup(file) -> Tuple[List[str], List[str]]:
    resources = []
    values = []
    board_color_map = {
        v["board_color"]: {"code": k, "color": v["color"]}
        for k, v in resources_map.items()
    }

    crop_image(file)
    OpenAI = OpenAIClient()
    for i in range(19):
        tile = OpenAI.parse_image_data(f"{tile_images_path}/tile_{i+1}.png")
        print(
            "Tile:{} {} {}".format(
                i + 1,
                tile["value"],
                colored(tile["color"], board_color_map[tile["color"]]["color"]),
            )
        )
        resources.append(board_color_map[tile["color"]]["code"])
        values.append(tile["value"])
    display_board_with_values(resources, values)
    return resources, values


@click.command()
@click.option(
    "--file", type=click.Path(), default=None, help="Path to the input file (optional)"
)
@click.option("--verbose", is_flag=True, help="Enable verbose output")
def start(file, verbose) -> None:
    if file:
        resources, values = automatic_setup(file)
        if verbose:
            print("Resources: ", resources)
            print("Values: ", values)
    else:
        resources, values = manual_setup()

    if not resources or not values:
        return 1
    return play(resources, values)


if __name__ == "__main__":
    start()
