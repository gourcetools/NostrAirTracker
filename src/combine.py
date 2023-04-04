from PIL import Image, ImageDraw, ImageOps, ImageFilter
from PIL.ImageFilter import Kernel
from PIL.ImageChops import add
from PIL.Image import LANCZOS


def overlay_images(far_img_path, close_img_path, output_img_path, position=(0, 0), box_size=(150, 150), border_color=(0, 0, 0), border_width=2, line_color=(0, 0, 0)):
    far_image = Image.open(far_img_path)
    close_image = Image.open(close_img_path)

    # Resize the close-up image to fit inside the box
    close_image_resized = close_image.resize(box_size, LANCZOS)

    # Add a border to the close-up image
    close_image_with_border = ImageOps.expand(close_image_resized, border=border_width, fill=border_color)

    # Calculate the position for the close-up image
    far_width, far_height = far_image.size
    position = (far_width - box_size[0] - border_width - 10, 10)

    # Overlay the close-up image on the far image
    far_image.paste(close_image_with_border, position)

    far_image.save(output_img_path)

if __name__ == "__main__":
    far_image_path = "close.png"
    close_image_path = "far.png"
    output_image_path = "overlay.png"
    box_size = (150, 150) # Adjust the box size as needed

    overlay_images(far_image_path, close_image_path, output_image_path, box_size=box_size)
