from typing import Any, List

from termcolor import colored

from board import display_full_board, display_probabilities
from config import (adjacent_settlement_positions, dice_probability, indexes,
                    resources_map)
from models.probability import Probability


def play(resources: List[str], values: List[str]) -> None:
    settlements = ""
    blocked_positions = ""

    while True:
        # Input new settlements positions
        new_settlements = input("Enter your settlements positions: ").strip()

        if new_settlements == ".":
            display_probabilities()
            continue

        elif len(new_settlements) == 2 and new_settlements[0] == "-":
            settlements = settlements.replace(new_settlements[1], "")
            for unblock_position in adjacent_settlement_positions[new_settlements[1]]:
                blocked_positions.replace(unblock_position, "")
            print(f"Settlement {new_settlements[1]} removed.", settlements)

        else:
            # Check if input is valid
            new_valid_settlements = ""
            for settlement in new_settlements:
                if settlement in settlements:
                    print(f"Settlement {settlement} already added.")
                    continue
                if settlement in blocked_positions:
                    print(f"Position {settlement} not available.")
                    continue
                new_valid_settlements += settlement
                blocked_positions += adjacent_settlement_positions[settlement]

            if not new_valid_settlements:
                continue
            settlements += new_valid_settlements

        display_full_board(resources, values, settlements, blocked_positions)

        # List resources per dice value
        # Calculate probabilities per resource
        proba_per_dice_value: dict[int, Any] = {}
        proba_per_resource: dict[str, dict[str, Any]] = {}
        for position in settlements:
            for case in indexes[position]:
                value = int(values[case - 1])
                if value == 0:
                    continue
                resource = resources_map[resources[case - 1]]
                if value not in proba_per_dice_value:
                    proba_per_dice_value[value] = []
                proba_per_dice_value[value].append(
                    colored(resource["text"].strip(), resource["color"])
                )

                if resources[case - 1] not in proba_per_resource:
                    proba_per_resource[resources[case - 1]] = Probability(
                        rate=0, proba=0.0, values=set()
                    )
                if value not in proba_per_resource[resources[case - 1]].values:
                    proba_per_resource[resources[case - 1]].values.add(value)
                    proba_per_resource[resources[case - 1]].proba += dice_probability[
                        value
                    ][0]
                    proba_per_resource[resources[case - 1]].rate += dice_probability[
                        value
                    ][1]

        any_resource = Probability(rate=0, proba=0.0, values=set())
        for value in proba_per_dice_value.keys():
            any_resource.proba += dice_probability[value][0]
            any_resource.rate += dice_probability[value][1]

        # Display resource to receive per dice value
        for value in sorted(proba_per_dice_value.keys()):
            print("[{}]\t{}".format(value, ", ".join(proba_per_dice_value[value])))
        print()

        # Display probability to receive each resources
        for resource, probas in dict(
            sorted(
                proba_per_resource.items(),
                key=lambda item: item[1].rate,
                reverse=True,
            )
        ).items():
            print(
                "{}:\t{}\t{}/36\t{}%".format(
                    colored(
                        resources_map[resource]["text"].strip(),
                        resources_map[resource]["color"],
                    ),
                    round(probas.proba, 3),
                    probas.rate,
                    probas.rate_percentage,
                )
            )

        # Display probability to receive any resource
        print(
            "Any:\t{}\t{}/36\t{}%".format(
                round(any_resource.proba, 3),
                any_resource.rate,
                any_resource.rate_percentage,
            )
        )
        print()
        print("Your settlements: {}".format(settlements))
