require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

const setPublicFile = async (fileId) => {
    try {
        await drive.permissions.create({
            fileId,
            requestBody: {
                role:'reader',
                type:'anyone'
            }
        })
        const getUrl = await drive.files.get({
          fileId,
          fields: "webViewLink, webContentLink, thumbnailLink",
        });
        return getUrl;
    } catch (err) {
        console.log(err)
    }
}

const uploadFile = async () => {
    try {
        const createFile = await drive.files.create({
          requestBody: {
            name: "iloveu",
            mimeType: "image/jpg, application/pdf",
          },
          media: {
            mimeType: "image/jpg, application/pdf",
            body: fs.createReadStream(path.join(__dirname, "./img.jpg")),
          },
        });
        const fileId = createFile.data.id
        const getUrl = await setPublicFile(fileId);
        console.log(getUrl.data);
        return getUrl;
    } catch (err) {
        console.log(err)
    }
}
uploadFile()