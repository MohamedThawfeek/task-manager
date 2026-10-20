const fs = require("fs/promises");

const getFileBuffer = async (file) => {
  if (!file) {
    throw new Error("File is required.");
  }

  if (Buffer.isBuffer(file)) {
    return file;
  }

  if (Buffer.isBuffer(file.data) && file.data.length > 0) {
    return file.data;
  }

  if (file.tempFilePath) {
    return fs.readFile(file.tempFilePath);
  }

  throw new Error("Unable to read the uploaded file.");
};

const fileToBase64 = async (file) => {
  const fileBuffer = await getFileBuffer(file);
  const mimeType = file.mimetype || "application/octet-stream";

  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
};

const filesToBase64 = async (files) => {
  if (!files || typeof files !== "object") {
    throw new Error("Files are required.");
  }

  const convertedFiles = {};

  for (const [fieldName, uploadedFile] of Object.entries(files)) {
    if (Array.isArray(uploadedFile)) {
      convertedFiles[fieldName] = await Promise.all(
        uploadedFile.map((file) => fileToBase64(file)),
      );
    } else {
      convertedFiles[fieldName] = await fileToBase64(uploadedFile);
    }
  }

  return convertedFiles;
};

module.exports = {
  fileToBase64,
  filesToBase64,
};
