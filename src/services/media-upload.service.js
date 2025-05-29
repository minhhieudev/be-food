import cloudinaryService from "./cloudinary.service.js";

class MediaUploadService {
  constructor() {
    this.uploadImageTemp = this.uploadImageTemp.bind(this);
    this.uploadMultipleImagesTemp = this.uploadMultipleImagesTemp.bind(this);
  }

  async uploadImageTemp(req, res) {
    try {
      const file = req.file;
      const result = await cloudinaryService.uploadMedia(file.buffer, 'temp/images', 'image')
      return res
        .status(200)
        .json({ success: true, data: { url: result.url } });
    } catch (error) {
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
  async uploadMultipleImagesTemp(req, res) {
    try {
      const files = req.files;
      const uploadPromises = files.map(async (file) => {
        const result = await cloudinaryService.uploadMedia(file.buffer, 'temp/images', 'image');
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      return res.status(200).json({ success: true, data: { urls: uploadedUrls } });
    } catch (error) {
      return res.status(500).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
  

  async uploadVideoTemp(req, res) {
    try {
      const file = req.file;
      const result = await cloudinaryService.uploadMedia(file.buffer, 'temp/videos', 'video')
      return res
        .status(200)
        .json({ success: true, data: { url: result.url } });
    } catch (error) {
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  // async moveMediaTemp(mediaTempPath) {
  //   const destinationPath = mediaTempPath.replace(/\/temp/, "");
  //   await awsS3ServiceInstance.moveMedia(mediaTempPath, destinationPath);
  //   return destinationPath
  // }

  // async cleanTempMediaEveryHour() {
  //   await awsS3ServiceInstance.cleanTemp('bio/temp/')
  // }


}

export default MediaUploadService;
