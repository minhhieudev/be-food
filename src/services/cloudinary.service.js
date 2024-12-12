import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: "dvxn12n91",
      api_key: "546637315817464",
      api_secret: "OoNsO-m4TL7lBs0ivOEuCsa0ZKA",
    });
  }

  async uploadMedia(fileBuffer, folder, resourceType = "auto") {
    // Create a readable stream from the buffer
    const stream = streamifier.createReadStream(fileBuffer);

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: folder,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.pipe(uploadStream);
      });

      return { url: result.secure_url, resourceType };
    } catch (error) {
      console.log("File upload failed", error);
      throw new Error("File upload failed");
    }
  }

  async getMedia(folder, resourceType) {
    try {
      const resources = await cloudinary.api.resources({
        type: "upload",
        prefix: folder,
        resource_type: resourceType,
        max_results: 500,
      });
      return resources.resources;
    } catch (error) {
      throw new Error("Failed to fetch media");
    }
  }

  async moveMedia(publicId, sourceFolder, destinationFolder, resourceType) {
    try {
      const newPublicId = `${destinationFolder}/${publicId.split("/").pop()}`;
      await cloudinary.uploader.rename(
        `${sourceFolder}/${publicId}`,
        newPublicId,
        {
          resource_type: resourceType,
        }
      );
      return cloudinary.url(newPublicId);
    } catch (error) {
      throw new Error("Failed to move media");
    }
  }

  async copyMedia(publicId, newFolder) {
    try {
      // Ensure the image exists
      const existingImage = await cloudinary.api.resource(publicId);
      if (!existingImage) {
        throw new Error("Image not found");
      }

      // Upload a new image with the same content but a different public ID
      const uploadResult = await cloudinary.uploader.upload(
        existingImage.secure_url,
        {
          folder: newFolder, // Keep it in the same folder
        }
      );

      return uploadResult.secure_url;
    } catch (error) {
      throw new Error("Failed to copy media");
    }
  }

  async deleteMedia(public_id, resourceType) {
    try {
      await cloudinary.uploader.destroy(public_id, {
        resource_type: resourceType,
      });
      return true;
    } catch (error) {
      throw new Error("Failed to delete old media");
    }
  }

  async deleteOldMedia(folder, resourceType, daysOld = 1) {
    try {
      const resources = await this.getMedia(folder, resourceType);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - daysOld);

      const mediaToDelete = resources.filter((item) => {
        const createdAt = new Date(item.created_at);
        return createdAt < oneDayAgo;
      });

      for (const item of mediaToDelete) {
        await cloudinary.uploader.destroy(item.public_id, {
          resource_type: resourceType,
        });
      }
    } catch (error) {
      throw new Error("Failed to delete old media");
    }
  }
}

const cloudinaryService = new CloudinaryService();

export default cloudinaryService;
