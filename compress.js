const express = require('express');
const parser = require('body-parser');
const imagemin = require('imagemin');
const png = require('imagemin-pngquant');

const app = express();
const port = 3000;
const sizeLimit = '10mb';

app.use(parser.json({limit: sizeLimit}));

// POST: base64 string 'image'
app.post('/', (req, res) => {
  if (req.body && req.body.image) {
    console.log('Received image');
    console.time('compress');

    imagemin
      .buffer(new Buffer(req.body.image, 'base64'), {
        plugins: [png({ quality: '65-80' })]
      })
      .then(d => {
        res.send({'base64': new Buffer(d).toString('base64')});
        console.log('Finished compression');
        console.timeEnd('compress');

      })
      .catch(e => {
        console.log(e);
      })

  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));