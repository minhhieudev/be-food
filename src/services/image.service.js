import path, { dirname } from "path";
import { fileURLToPath } from "url";

class ImageService {
  async getService(req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const { name } = req.params;
    res.sendFile(path.join(__dirname, `../../public/images/services/${name}`));
  }
}
export default ImageService;
