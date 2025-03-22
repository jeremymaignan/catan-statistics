import cv2
import numpy as np
from config import tile_images_path
import os

# Helper function to crop hexagonal tile
def crop_hexagon(image, center, tile_size):
    mask = np.zeros_like(image[:,:,0])
    y, x = np.ogrid[:image.shape[0], :image.shape[1]]
    cx, cy = center
    angles = np.deg2rad(np.arange(30, 390, 60))  # Adjusted to have angles at top and bottom
    
    # radius approximation
    r = tile_size/3
    
    points = np.array([[
        cx + r*np.cos(angle), cy + r*np.sin(angle)
    ] for angle in angles], np.int32)

    cv2.fillConvexPoly(mask, points, 255)

    hexagon = cv2.bitwise_and(image, image, mask=mask)

    # bounding rect to crop hex tile properly
    x, y, w, h = cv2.boundingRect(points)
    return hexagon[y:y+h, x:x+w]

def crop_image(filename):
    # Load image
    image = cv2.imread(filename)

    # Measurements of the image
    height, width, _ = image.shape

    # Approximate manually
    tile_height = height // 4.5

    # Define tile centers manually (approximation)
    tile_centers = [
        # Row 1 (3 tiles)
        (width*0.3, tile_height*0.55), 
        (width*0.5, tile_height*0.55),
        (width*0.7, tile_height*0.55),

        # Row 2 (4 tiles)
        (width*0.2, tile_height*1.4), 
        (width*0.4, tile_height*1.4),
        (width*0.6, tile_height*1.4),
        (width*0.8, tile_height*1.4),

        # Row 3 (5 tiles)
        (width*0.1, tile_height*2.25),
        (width*0.3, tile_height*2.25), 
        (width*0.5, tile_height*2.25),
        (width*0.7, tile_height*2.25),
        (width*0.9, tile_height*2.25),

        # Row 4 (4 tiles)
        (width*0.2, tile_height*3.1), 
        (width*0.4, tile_height*3.1),
        (width*0.6, tile_height*3.1),
        (width*0.8, tile_height*3.1),

        # Row 5 (3 tiles)
        (width*0.3, tile_height*3.9), 
        (width*0.5, tile_height*3.9),
        (width*0.7, tile_height*3.9),
    ]
    # Create folder if it does not exist
    if not os.path.exists(tile_images_path):
        os.makedirs(tile_images_path)

    # Iterate each center tile and save image
    for i, center in enumerate(tile_centers):
        hex_img = crop_hexagon(image, center, tile_height*0.9)
        filename = f"{tile_images_path}/tile_{i+1}.png"
        cv2.imwrite(filename, hex_img)
        print(f"Saved: {filename}")

    print("All tiles cropped successfully!")
