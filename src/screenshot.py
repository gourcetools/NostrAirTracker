import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from PIL import Image

def take_screenshot(url, output_path, zoom_count, crop_settings):
    chrome_driver_path = "./chromedriver"
    chrome_options = webdriver.ChromeOptions()
    chrome_options.headless = True
    service = Service(executable_path=chrome_driver_path)
    
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_window_size(1920, 1080)

    driver.get(url)
    time.sleep(10)

    for _ in range(zoom_count):
        driver.find_element_by_tag_name("body").send_keys(Keys.ADD)
        time.sleep(1)

    driver.save_screenshot("temp_screenshot.png")
    driver.quit()

    crop_image("temp_screenshot.png", output_path, crop_settings)

def crop_image(input_path, output_path, crop_settings):
    left, top, right, bottom = crop_settings["left"], crop_settings["top"], crop_settings["right"], crop_settings["bottom"]

    with Image.open(input_path) as img:
        width, height = img.size
        cropped_img = img.crop((left, top, width - right, height - bottom))
        cropped_img.save(output_path)

url = "https://globe.adsbexchange.com/?icao=a835af"
output_path = "screenshot.png"
zoom_count = 10
crop_settings = {"left": 250, "top": 0, "right": 650, "bottom": 0}

def main():
    start_time = time.time()

    take_screenshot(url, output_path, zoom_count, crop_settings)

    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Execution time: {execution_time:.2f} seconds")

if __name__ == "__main__":
    main()
