# Catan Probabilities Calculator
**A probability calculator for the board game *The Settlers of Catan*.**

## Setup and Usage

### Requirements
- python3

### Installation

Install the required dependencies by running:

```sh
pip install -r requirements.txt
```

## Usage

### Option 1: Automatic Loading with OpenAI (optionnal)

1. Export your OpenAI API key as an environment variable:

   ```sh
   export OPENAI_API_KEY={YOUR_KEY}
   ```

2. Take a screenshot of the Catan board, ensuring that it is perfectly aligned with no margins like this:
![Screenshot](https://github.com/jeremymaignan/catan-statistics/blob/main/assets/screenshot_example.png)

3. Start the program with the `--file` flag:

   ```sh
   python3 main.py --file board.png
   ```

   The resources and values will be parsed by OpenAI, and your full board will be displayed.

### Option 2: Manual Input of Resources and Values

1. Start the program:

   ```sh
   python3 main.py
   ```
2. Enter the resources for each tile of the board.

![Screenshot](https://github.com/jeremymaignan/catan-statistics/blob/main/assets/resources.png)

3. Enter the values for each tile of the board.

![Screenshot](https://github.com/jeremymaignan/catan-statistics/blob/main/assets/values.png)

### Playing the Game

Once setup is complete, you can enter your settlement positions using the board map.

- You will now see statistics about the resources you can receive in each round.
- You can add new settlements at any time, and the probabilities will be updated automatically.
- To view the static probabilities of each dice roll, input `.`.

![Screenshot](https://github.com/jeremymaignan/catan-statistics/blob/main/assets/settlements.png)
![Screenshot](https://github.com/jeremymaignan/catan-statistics/blob/main/assets/board.png)
![Static Dice Roll Prova](https://github.com/jeremymaignan/catan-statistics/blob/main/assets/static_dice_roll_probabilities.png)

Enjoy optimizing your strategy with **Catan Statistics**! 🚀