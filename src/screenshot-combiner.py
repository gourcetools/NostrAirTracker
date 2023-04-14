import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageOps

def round_corners(image, radius):
    circle = Image.new('L', (radius * 2, radius * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, radius * 2, radius * 2), fill=255)

    alpha = Image.new('L', image.size, 255)
    w, h = image.size

    alpha.paste(circle.crop((0, 0, radius, radius)), (0, 0))
    alpha.paste(circle.crop((0, radius, radius, radius * 2)), (0, h - radius))
    alpha.paste(circle.crop((radius, 0, radius * 2, radius)), (w - radius, 0))
    alpha.paste(circle.crop((radius, radius, radius * 2, radius * 2)), (w - radius, h - radius))

    image.putalpha(alpha)
    return image

def add_border(image, border_size, border_color):
    return ImageOps.expand(image, border=border_size, fill=border_color)

def find_best_location(zoomed_out, zoomed_in):
    zoomed_out_gray = cv2.cvtColor(np.array(zoomed_out), cv2.COLOR_RGB2GRAY)
    zoomed_in_gray = cv2.cvtColor(np.array(zoomed_in), cv2.COLOR_RGB2GRAY)

    result = cv2.matchTemplate(zoomed_out_gray, zoomed_in_gray, cv2.TM_CCOEFF_NORMED)
    _, _, min_loc, max_loc = cv2.minMaxLoc(result)

    # Return the location with the highest similarity
    return max_loc

def combine_screenshots(zoomed_out_path, zoomed_in_path, output_path):
    # Load images
    zoomed_out = Image.open(zoomed_out_path)
    zoomed_in = Image.open(zoomed_in_path)

    # Resize the zoomed-in image
    zoomed_in = zoomed_in.resize((zoomed_out.width // 3, zoomed_out.height // 3))

    # Round the corners and add a black border to the zoomed-in image
    zoomed_in = round_corners(zoomed_in, 20)
    zoomed_in = add_border(zoomed_in, 2, 'black')

    # Add a black border to the zoomed-out image
    zoomed_out = add_border(zoomed_out, 2, 'black')

    # Find the best location to place the zoomed-in image
    best_location = find_best_location(zoomed_out, zoomed_in)

    # Create a new image with a white background to combine the images
    combined = Image.new('RGB', (zoomed_out.width, zoomed_out.height), color='white')
    combined.paste(zoomed_out, (0, 0))
    combined.paste(zoomed_in, best_location, zoomed_in)

    # Save the combined image
    combined.save(output_path)

# Replace these paths with the actual paths to your screenshots
zoomed_out_path = '../data/far.png'
zoomed_in_path = '../data/close.png'
output_path = '../data/plane.png'

combine_screenshots(zoomed_out_path, zoomed_in_path, output_path)
