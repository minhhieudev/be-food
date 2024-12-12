import fs from "fs";
import path from "path";
class UploadService {
  async uploadImage(req, res) {
    try {
      const file = req.file;
      const newImage = {
        fileName: file.filename,
        url: `${req.protocol}://${req.get("host")}/images/${file.filename}`,
      };

      res.status(200).send({
        success: true,
        data: { images: newImage },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }

  async getImage(req, res) {
    try {
      const uploadDir = "src/uploads/";
      const { fileName } = req.query;

      if (!fileName){
        throw "Tên hình ảnh không được để trống";
      }
      
      const imagePath = path.join(uploadDir, fileName);
     
      if (!fs.existsSync(imagePath)) {
        throw "Không tìm thấy hình ảnh";
      }
      const imageInfo = {
        name: fileName,
        url: `${req.protocol}://${req.get("host")}/images/${fileName}`,
      };
    
      res.status(200).send({
        success: true,
        data: { image: imageInfo },
      });
    } catch (error) {
      console.log("error: ", error);
      return res.status(200).send({
        success: false,
        alert: "error",
        message: `${error}`,
        error,
      });
    }
  }
}

export default UploadService;
