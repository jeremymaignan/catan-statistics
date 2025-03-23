from typing import Any, List

from termcolor import colored

from board import display_full_board
from config import dice_probability, indexes, resources_map
from models.probability import Probability


def play(resources: List[str], values: List[str]) -> None:
    settlements = ""

    while True:
        # Input new settlements positions
        new_settlement = input("Enter your settlements positions: ").strip()

        if new_settlement == ".":
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
            continue
        if new_settlement in settlements:
            print("Settlement already added.")
            continue
        settlements += new_settlement
        display_full_board(resources, values, settlements)

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
                    colored(resource["text"], resource["color"])
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
