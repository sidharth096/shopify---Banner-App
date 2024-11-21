import crypto from 'crypto'

export const encrypt = (text, key) => {
  const iv = crypto.randomBytes(12); // Generate a random IV
  const cipher = crypto.createCipheriv("aes-128-gcm", Buffer.from(key), iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag().toString('base64'); // Capture the auth tag

  return {
    iv: iv.toString("hex"),
    encryptedText: encrypted,
    authTag: authTag // Include the auth tag in the result
  };
};

export const decrypt = (encryptedData, key) => {
  const iv = Buffer.from(encryptedData.iv, "hex");
  const decipher = crypto.createDecipheriv("aes-128-gcm", Buffer.from(key), iv);

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64')); // Use the auth tag

  let decrypted = decipher.update(encryptedData.encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};




