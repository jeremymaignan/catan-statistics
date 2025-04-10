from typing import List

from termcolor import colored

from config import (dice_probability, resources_map, settlements_icon,
                    settlements_positions)

map_resouces = """
        +---+---+---+---+---+---+
        | {} | {} | {} |
    +---+---+---+---+---+---+---+---+
    | {} | {} | {} | {} |
+---+---+---+---+---+---+---+---+---+---+
| {} | {} | {} | {} | {} |
+---+---+---+---+---+---+---+---+---+---+
    | {} | {} | {} | {} |
    +---+---+---+---+---+---+---+---+
        | {} | {} | {} |
        +---+---+---+---+---+---+
"""

map_resources_and_values = """
        +---+---+---+---+---+---+
        | {} | {} | {} |
        |   {}  |   {}  |  {}   |
    +---+---+---+---+---+---+---+---+
    | {} | {} | {} | {} |
    |   {}  |   {}  |   {}  |   {}  |
+---+---+---+---+---+---+---+---+---+---+
| {} | {} | {} | {} | {} |
|   {}  |   {}  |   {}  |   {}  |   {}  |
+---+---+---+---+---+---+---+---+---+---+
    | {} | {} | {} | {} |
    |   {}  |   {}  |   {}  |   {}  |
    +---+---+---+---+---+---+---+---+
        | {} | {} | {} |
        |   {}  |   {}  |  {}   |
        +---+---+---+---+---+---+
"""

map_resouces_angle = """
        a--b--c--d--e--f--g
        |     |     |     |
    h--i--j--k--l--m--n--o--p
    |     |     |     |     |
q--r--s--t--u--v--w--x--y--z--1
|     |     |     |     |     |
A--B--C--D--E--F--G--H--I--J--K
   |     |     |     |     |
   L--M--N--O--P--Q--R--S--T
      |     |     |     |
      U--V--W--X--Y--Z--2
"""

map_resources_and_values_and_angles = """
        {}---{}---{}---{}---{}---{}---{}
        | {} | {} | {} |
        |   {}  |   {}  |  {}   |
    {}---{}---{}---{}---{}---{}---{}---{}---{}
    | {} | {} | {} | {} |
    |   {}  |   {}  |   {}  |   {}  |
{}---{}---{}---{}---{}---{}---{}---{}---{}---{}---{}
| {} | {} | {} | {} | {} |
|   {}  |   {}  |   {}  |   {}  |   {}  |
{}---{}---{}---{}---{}---{}---{}---{}---{}---{}---{}
    | {} | {} | {} | {} |
    |   {}  |   {}  |   {}  |   {}  |
    {}---{}---{}---{}---{}---{}---{}---{}---{}
        | {} | {} | {} |
        |   {}  |   {}  |  {}   |
        {}---{}---{}---{}---{}---{}---{}
"""


def display_board_with_resources(resources: List[str]):
    print(
        map_resouces.format(
            *[
                colored(resources_map[x]["text"], resources_map[x]["color"])
                for x in resources
            ]
        )
    )


def display_board_with_values(resources: List[str], values: List[str]):
    # Display map
    formated_values = ["{} ".format(x) if int(x) <= 9 else x for x in values]
    colored_resources = [
        colored(resources_map[x]["text"], resources_map[x]["color"]) for x in resources
    ]
    display = (
        settlements_positions[:7]
        + colored_resources[:3]
        + formated_values[:3]
        + settlements_positions[7:16]
        + colored_resources[3:7]
        + formated_values[3:7]
        + settlements_positions[16:27]
        + colored_resources[7:12]
        + formated_values[7:12]
        + settlements_positions[27:38]
        + colored_resources[12:16]
        + formated_values[12:16]
        + settlements_positions[38:47]
        + colored_resources[16:19]
        + formated_values[16:19]
        + settlements_positions[47:]
    )
    print(map_resources_and_values_and_angles.format(*display))


def display_full_board(
    resources: List[str], values: List[str], settlements: str, blocked_positions: str
):  # Display current map
    settlements_position = []

    for post in settlements_positions:
        if post in settlements:
            settlements_position.append(settlements_icon)
        elif post in blocked_positions:
            settlements_position.append("-")
        else:
            settlements_position.append(post)

    formated_values = ["{} ".format(x) if int(x) <= 9 else x for x in values]
    colored_resources = [
        colored(resources_map[x]["text"], resources_map[x]["color"]) for x in resources
    ]
    display = (
        settlements_position[:7]
        + colored_resources[:3]
        + formated_values[:3]
        + settlements_position[7:16]
        + colored_resources[3:7]
        + formated_values[3:7]
        + settlements_position[16:27]
        + colored_resources[7:12]
        + formated_values[7:12]
        + settlements_position[27:38]
        + colored_resources[12:16]
        + formated_values[12:16]
        + settlements_position[38:47]
        + colored_resources[16:19]
        + formated_values[16:19]
        + settlements_position[47:]
    )
    print(map_resources_and_values_and_angles.format(*display))


def display_probabilities():
    for key, value in dice_probability.items():
        if key == 0:
            continue
        print(
            "[{}]:\t{}\t{}/36\t{}%".format(
                colored(key, value[2]),
                round(value[0], 3),
                value[1],
                int(value[1] * 100 / 36),
            )
        )
