import base64
import json
import re

from openai import OpenAI

client = OpenAI()


# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


prompt = """
Parse this picture and return the background color and number.

The color can be grey, brown, yellow, beige, light green or dark green.

If there is no number on it, set it to 7 and the color should be beige.
If there is a number on it, the number cannot be 7 and the color cannot be beige.

The output format must be JSON such as:
{
    "value": 2,
    "color": "yellow"
} 
"""


def clean_json_response(content):
    # Remove markdown code blocks
    json_match = re.search(r"```json\n(.*)\n```", content, re.DOTALL)
    return json_match.group(1) if json_match else content  # Extract JSON part only


def parse_image_data(image_path):
    # Getting the Base64 string
    base64_image = encode_image(image_path)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt,
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
    )

    raw_content = response.choices[0].message.content.strip()
    cleaned_content = clean_json_response(raw_content)
    parsed_content = json.loads(cleaned_content)
    print(image_path, parsed_content)
    return parsed_content
