const express = require('express');
const parser = require('body-parser');
const imagemin = require('imagemin');
const type = require('file-type');
const png = require('imagemin-pngquant');
const jpg = require('imagemin-mozjpeg')
const AWS = require('aws-sdk');
const crypto = require('crypto');

const app = express();
const port = 3000;
const sizeLimit = '17mb';
const bucket = 'compression-test';
const s3 = new AWS.S3({ params: { Bucket: bucket } });

app.use(parser.json({limit: sizeLimit}));

// POST: base64 string 'image'
app.post('/', (req, res) => {
  if (req.body && req.body.image) {
    console.log('Received image');
    console.time('compress');

    const imageBuffer = Buffer.from(req.body.image, 'base64');
    const { ext, mime } = type(imageBuffer);

    imagemin
      .buffer(imageBuffer, {
        plugins: [
          png({ quality: '65-80' }),
          jpg({ quality: 70 })
        ]
      })
      .then(data => {
        // Create file name
        const fileBuf = crypto.randomBytes(20);
        const fileName = `${fileBuf.toString('hex')}.${ext}`;

        // Create s3 object
        const s3data = {
          Body: Buffer.from(data),
          Key: fileName,
          ACL: 'public-read',
          ContentType: mime
        };

        // Send to s3
        s3.upload(s3data, {}, (err, resp) => {
          if (err) throw err;

          console.log(resp);
          console.timeEnd('compress');
        });
        
        res.send({ success: true, file_name: fileName });
      })
      .catch(e => {
        console.log(e);
      });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));