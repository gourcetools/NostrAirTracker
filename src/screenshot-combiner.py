from PIL import Image, ImageDraw, ImageOps, ImageFilter
from PIL.ImageFilter import Kernel
from PIL.ImageChops import add
from PIL.ImageFilter import GaussianBlur
from PIL.Image import Resampling

def add_shadow(image, offset=(5, 5), background_color=(0, 0, 0, 0), shadow_color=(0, 0, 0), blur_radius=15):
    shadow = Image.new("RGBA", image.size, background_color)
    shadow.paste(shadow_color, (offset[0], offset[1], image.width + offset[0], image.height + offset[1]))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius))
    result = Image.alpha_composite(shadow, image.convert("RGBA"))
    return result.convert(image.mode)

def rounded_rectangle(size, radius, fill):
    width, height = size
    rectangle = Image.new("L", size, 0)
    draw = ImageDraw.Draw(rectangle)
    draw.ellipse((0, 0, 2 * radius, 2 * radius), fill=fill)
    draw.rectangle((radius, 0, width - radius, height), fill=fill)
    draw.rectangle((0, radius, width, height - radius), fill=fill)
    draw.ellipse((width - 2 * radius, height - 2 * radius, width, height), fill=fill)
    return rectangle

def overlay_images(far_img_path, close_img_path, output_img_path, position=(0, 0), box_size=(300, 150), border_color=(0, 0, 0), border_width=2, line_color=(0, 0, 0)):
    far_image = Image.open(far_img_path)
    close_image = Image.open(close_img_path)

    # Resize the close-up image to fit inside the box
    close_image_resized = close_image.resize(box_size, Resampling.LANCZOS)

    # Add a border to the close-up image
    border_radius = 10
    close_image_with_border = ImageOps.expand(close_image_resized, border=border_width, fill=border_color)

    # Create the alpha mask with rounded corners for the close-up image with the border
    mask = rounded_rectangle(close_image_with_border.size, border_radius, 255)
    close_image_with_border.putalpha(mask)

    # Add a shadow to the close-up image
    close_image_with_shadow = add_shadow(close_image_with_border)

    # Calculate the position for the close-up image
    far_width, far_height = far_image.size
    position = (far_width - box_size[0] - border_width - 10, 10)

    # Overlay the close-up image on the far image
    far_image.paste(close_image_with_shadow, position, close_image_with_shadow)

    far_image.save(output_img_path)

if __name__ == "__main__":
    far_image_path = "../data/far.png"
    close_image_path = "../data/close.png"
    output_image_path = "../data/plane.png"
    box_size = (300, 150) # Adjust the box size as needed

    overlay_images(far_image_path, close_image_path, output_image_path, box_size=box_size)
