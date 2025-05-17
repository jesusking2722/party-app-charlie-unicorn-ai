import { MediaItem } from "@/app/events/create";
import { IMGBB_API_KEY } from "@/constant";
import * as FileSystem from "expo-file-system";

/**
 * Uploads multiple images to ImgBB in a React Native environment
 * @param mediaItems Array of MediaItem objects (images only)
 * @returns Promise with array of uploaded URLs
 */
export const uploadMultipleToImgBB = async (
  mediaItems: MediaItem[]
): Promise<string[]> => {
  // Show what we're uploading
  console.log(`Uploading ${mediaItems.length} images to ImgBB`);

  const uploadPromises = mediaItems.map(async (mediaItem, index) => {
    try {
      console.log(
        `Processing image ${index + 1}/${
          mediaItems.length
        }: ${mediaItem.uri.substring(0, 30)}...`
      );

      // Read the file as base64
      const base64Data = await FileSystem.readAsStringAsync(mediaItem.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Prepare the form data
      const formData = new FormData();
      formData.append("image", base64Data);

      // Upload to ImgBB
      console.log(`Uploading image ${index + 1} to ImgBB...`);
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ImgBB upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("ImgBB upload rejected");
      }
      return data.data.url;
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      return null;
    }
  });

  // Filter out any failed uploads (null values)
  const results = await Promise.all(uploadPromises);
  const validUrls = results.filter((url) => url !== null) as string[];

  return validUrls;
};
