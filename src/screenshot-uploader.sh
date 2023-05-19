#!/bin/bash
    echo "==== screenshot-uploader.sh ===="

# This script uploads an image to a file hosting service and provides a URL to the uploaded image.

# Set the image file path
IMAGE_PATH="../data/plane.png"

# Function to check if the image file exists
check_image_existence() {
  if [[ ! -e "$IMAGE_PATH" ]]; then
    echo "Warning: Image file '$IMAGE_PATH' not found. Retaking the screenshot."
    
    if ! command -v node &> /dev/null; then
      echo "Error: Node.js is not installed. Please install Node.js and try again."
      exit 1
    fi

    if ! command -v python3 &> /dev/null; then
      echo "Error: Python 3 is not installed. Please install Python 3 and try again."
      exit 1
    fi

    node screenshot-taker.js
    screenshot_taker_exit_code=$?
    
    if [[ $screenshot_taker_exit_code -eq 0 ]]; then
      python3 screenshot-combiner.py
    else
      echo "Error: Failed to execute screenshot-taker.js. Please check the script for any issues."
      exit 1
    fi

    if [[ ! -e "$IMAGE_PATH" ]]; then
      echo "Error: Image file '$IMAGE_PATH' not found after retaking the screenshot."
      exit 1
    fi
  fi
}

# Function to upload the image using curl to different hosting services
upload_image() {
  case $1 in
    0x0)
      response=$(curl -s -F "file=@$IMAGE_PATH" https://0x0.st)
      ;;
    fileio)
      response=$(curl -s -F "file=@$IMAGE_PATH" https://file.io)
      ;;
    # Add more hosting services here
    *)
      echo "Error: Unknown hosting service."
      exit 1
      ;;
  esac
}

# Check if the image file exists, and retake the screenshot if necessary
check_image_existence

# Upload the image to multiple hosting services until successful
for service in 0x0 fileio; do
  upload_image $service

  if [[ -z "$response" ]]; then
    echo "Error: No response from $service. Trying another service."
  elif [[ $response == *"$service"* ]]; then
    image_url=$(echo "$response" | grep -oP 'https?://\S+')
    echo "Image uploaded successfully to $service. URL: $image_url"
    echo "$image_url" >> ../data/MESSAGE.txt
    rm -f ../data/*.png 
    exit 0
  else
    echo "Image upload failed on $service. Trying another service."
  fi
done

echo "Error: Image upload failed on all services. Please try again."
exit 1
