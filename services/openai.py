import base64
import json
import re
from typing import Any, Dict

from openai import OpenAI

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
    def __init__(self, client: OpenAI = None, model: str = "gpt-4o"):
        """
        Initializes the OpenAI client.
        :param client: Optional OpenAI client instance for dependency injection.
        :param model: The OpenAI model to use.
        """
        self.client = client or OpenAI()
        self.model = model

    def _encode_image(self, image_path: str) -> str:
        """
        Encodes an image file to a Base64 string.
        :param image_path: Path to the image file.
        :return: Base64-encoded string.
        """
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode("utf-8")
        except FileNotFoundError:
            raise ValueError(f"Image file not found: {image_path}")
        except Exception as e:
            raise RuntimeError(f"Error encoding image: {e}")

    def _clean_json_response(self, content: str) -> str:
        """
        Cleans and extracts the JSON response from the OpenAI API.
        :param content: The raw response content.
        :return: Extracted JSON string.
        """
        match = re.search(r"```json\n(.*?)\n```", content, re.DOTALL)
        return match.group(1) if match else content.strip()

    def parse_image_data(self, image_path: str) -> Dict[str, Any]:
        """
        Parses image data using OpenAI's API.
        :param image_path: Path to the image file.
        :return: Parsed JSON response as a dictionary.
        """
        base64_image = self._encode_image(image_path)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
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
                    }
                ],
            )

            raw_content = response.choices[0].message.content
            cleaned_content = self._clean_json_response(raw_content)
            return json.loads(cleaned_content)

        except json.JSONDecodeError:
            raise ValueError("Failed to parse JSON response from OpenAI.")
        except Exception as e:
            raise RuntimeError(f"OpenAI API request failed: {e}")
