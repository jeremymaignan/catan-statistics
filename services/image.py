import os
from pathlib import Path

import cv2
import numpy as np

from config import tile_images_path

# Constants
TILE_SCALE_FACTOR = 2.5
TILE_HEIGHT_DIVISOR = 4.5
HEX_ANGLES = np.deg2rad(np.arange(30, 390, 60))  # Hexagonal angles
TILE_IMAGES_PATH = Path(tile_images_path)  # Directory for output images


def crop_hexagon(image: np.ndarray, center: tuple, tile_size: float) -> np.ndarray:
    """
    Crops a hexagonal region from the image.

    :param image: Input image as a NumPy array.
    :param center: (x, y) coordinates of the hexagon center.
    :param tile_size: Approximate size of the hexagonal tile.
    :return: Cropped hexagonal tile image.
    """
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cx, cy = center
    radius = tile_size / TILE_SCALE_FACTOR

    # Compute hexagon points
    points = np.column_stack(
        [cx + radius * np.cos(HEX_ANGLES), cy + radius * np.sin(HEX_ANGLES)]
    ).astype(np.int32)

    # Create hexagonal mask
    cv2.fillConvexPoly(mask, points, 255)

    # Apply mask
    hexagon = cv2.bitwise_and(image, image, mask=mask)

    # Crop to bounding box
    x, y, w, h = cv2.boundingRect(points)
    return hexagon[y : y + h, x : x + w]


def crop_image(filename: str):
    """
    Crops hexagonal tiles from an image and saves them to disk.

    :param filename: Path to the input image file.
    """
    # Load image
    image = cv2.imread(filename)
    if image is None:
        raise FileNotFoundError(f"Error: Unable to read image '{filename}'.")

    # Image dimensions
    height, width = image.shape[:2]
    tile_height = height / TILE_HEIGHT_DIVISOR  # Estimate tile height

    # Define tile centers (approximated manually)
    tile_centers = [
        (width * x, tile_height * y)
        for x, y in [
            (0.3, 0.55),
            (0.5, 0.55),
            (0.7, 0.55),  # Row 1
            (0.2, 1.4),
            (0.4, 1.4),
            (0.6, 1.4),
            (0.8, 1.4),  # Row 2
            (0.1, 2.25),
            (0.3, 2.25),
            (0.5, 2.25),
            (0.7, 2.25),
            (0.9, 2.25),  # Row 3
            (0.2, 3.1),
            (0.4, 3.1),
            (0.6, 3.1),
            (0.8, 3.1),  # Row 4
            (0.3, 3.9),
            (0.5, 3.9),
            (0.7, 3.9),  # Row 5
        ]
    ]

    # Ensure output directory exists
    TILE_IMAGES_PATH.mkdir(parents=True, exist_ok=True)

    # Process each tile
    for i, center in enumerate(tile_centers):
        hex_img = crop_hexagon(image, center, tile_height * 0.9)
        output_path = TILE_IMAGES_PATH / f"tile_{i+1}.png"
        cv2.imwrite(str(output_path), hex_img)

    print(f"All tiles cropped successfully! Saved in '{TILE_IMAGES_PATH}'")
