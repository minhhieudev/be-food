
async function LanguageMiddleware(req, res, next) {
  try {
    const language = req.headers["x-api-language"] || "vi";

    req.header = {
      ...req.headers,
      lang: language,
    };
    
    next();
  } catch (error) {
    console.log({ error });
    return res.status(401).json({
      success: false,
      message: error,
    });
  }
}

export default LanguageMiddleware;
