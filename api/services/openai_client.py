import base64
import json
import re

from openai import OpenAI

from api.config import COLOR_TO_RESOURCE, OPENAI_API_KEY

PROMPT = """
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


class OpenAIClient:
    def __init__(self, model="gpt-4o"):
        self.client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
        self.model = model

    def parse_tile(self, image_path):
        """Parse a single tile image and return (resource_code, value)."""
        if not self.client:
            raise RuntimeError("OpenAI API key not configured")

        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode("utf-8")

        response = self.client.chat.completions.create(
            model=self.model,
            temperature=0,
            top_p=1,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        },
                    },
                ],
            }],
        )

        raw = response.choices[0].message.content
        match = re.search(r"```json\n(.*?)\n```", raw, re.DOTALL)
        cleaned = match.group(1) if match else raw.strip()
        data = json.loads(cleaned)

        color = data.get("color", "beige")
        value = data.get("value", 0)
        resource_code = COLOR_TO_RESOURCE.get(color, "r")

        # Desert tile: value becomes 0
        if resource_code == "r":
            value = 0

        return resource_code, str(value)

    def parse_board(self, tile_paths):
        """Parse all 19 tiles and return (resources, values) lists."""
        resources = []
        values = []
        for path in tile_paths:
            resource, value = self.parse_tile(path)
            resources.append(resource)
            values.append(value)
        return resources, values
