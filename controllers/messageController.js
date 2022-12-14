const Messages = require("../models/messageModel");
require("dotenv").config();
const fs = require("fs");
const { google } = require("googleapis");
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      // console.log(111,msg);
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        typeMsg: msg.message.typeMsg,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, type } = req.body;
    const data = await Messages.create({
      message: { text: message, typeMsg: type },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.addFile = async (req, res, next) => {
  console.log(REFRESH_TOKEN);
  const file = req.file;
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  const setPublicFile = async (fileId) => {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      const getUrl = await drive.files.get({
        fileId,
        fields:
          "webViewLink, webContentLink, thumbnailLink, iconLink, mimeType",
      });
      return getUrl;
    } catch (err) {
      console.log(err);
    }
  };

  try {
    const createFile = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimeType,
      },
      media: {
        mimeType: file.mimeType,
        body: fs.createReadStream(file.path),
      },
    });
    const fileId = createFile.data.id;
    const getUrl = await setPublicFile(fileId);
    return res
      .status(200)
      .json({ ...getUrl.data, fileName: file.originalname });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
