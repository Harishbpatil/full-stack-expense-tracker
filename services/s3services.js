const AWS = require('aws-sdk')
require('dotenv').config()


exports.downloadExpenses = async (req, res) => {
    try {
      const expenses = await req.user.getExpenses();
      const expensesToString = JSON.stringify(expenses);
      const fileName = `expense${req.user.id}/${new Date()}.txt`;
      const fileUrl = await uploadToS3(expensesToString, fileName);
      return res.json({ fileUrl: fileUrl.Location, success: true });
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .json({ success: false, msg: "Internal server error" });
    }
  };
  
  function uploadToS3(data, fileName) {
    const s3Bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: data,
      ACL: "public-read",
    };
  
    return new Promise((resolve, reject) => {
      s3Bucket.upload(params, function (err, data) {
        if (err) reject("error");
  
        resolve(data);
      });
    });
  }
    module.exports = {uploadToS3}