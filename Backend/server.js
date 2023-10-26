const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { S3Client, GetObjectCommand,PutObjectCommand } = require("@aws-sdk/client-s3");





app.use(express.json());
app.use(cors()); 
app.use(bodyParser.urlencoded({ extended: true }));
const { Configuration, OpenAI } = require('openai');
const multer = require('multer');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.apikey });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '');
  },
  filename: (req, file, cb) => {
    console.log('file', file);
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage }).single('file');
var filePath

app.post('/getImages', async (req, res) => {
  try {
    const image = await openai.images.generate({
      prompt: req.body.message,
      n: 5,
      size: '512x512',
    });

    res.json(image.data);
    console.log(image.data);
  } catch (error) {
    console.error(error);
  }
});



// Configure AWS SDK with your credentials
AWS.config.update({
  accessKeyId: "AKIAY2BD7CLIEWJUF3VT",
  secretAccessKey:"nH8LLv4n10TL9nPsQinG50Iv0EL3uL2ZtEbbN43U",
  region: 'ap-south-1',                                         
});

const s3 = new AWS.S3();

// Set up Multer to handle file uploads
// const storage = multer.memoryStorage(); // This stores the file in memory
// const uploadMiddleware = multer({ storage });



app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle multer-specific errors
      return res.status(400).json({ message: 'Multer error', error: err.message });
    } else if (err) {
      // Handle other errors
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
      filePath=req.file.path

      console.log('filePath:',filePath)
    // If no error occurred, continue with successful response
    res.status(200).json({ message: 'File uploaded successfully' });

    // next()
  });
 

  // if (!req.file) {
  //   return res.status(400).json({ message: 'No file uploaded.' });
  // }

  // const localFilePath = path.join(__dirname, 'uploads', `${Date.now()}_${path.basename(req.file.originalname)}`);


  // const params = {
  //   Bucket:'harsh45bucket',
  //   Key: `${Date.now()}_${path.basename(req.file.originalname)}`, // Unique key for the S3 object
  //   Body: req.file.buffer,
  // };

  // // Upload the file to S3
  // s3.upload(params, (err, data) => {
  //   if (err) {
  //     return res.status(500).json({ error: err.message });
  //   }

    
  //   res.status(200).json({ message: 'File uploaded successfully', data });
  //   filePath=data.Key
  //   console.log(data)
  // });


});


app.post('/variations',async(req,res)=>{

  try {
    console.log('Received request to /variations');
    console.log('filePath:', filePath); // Debug statement

    if (!filePath) {
      return res.status(400).json({ message: 'File path is not set' });
    }
    const image = await openai.images.createVariation({
      image: fs.createReadStream(filePath),
      n:5,
      size:"512x512"
    });
  
  //  res.send(image.data.data)
  res.send(image.data)

console.log(image.data)
  } catch (error) {
    
   console.error(error)
    
  }

})



// app.post('/variations', async (req, res) => {
//   try {
//     console.log('Received request to /variations');
//     console.log('filePath:', filePath); // Debug statement

//     if (!filePath) {
//       return res.status(400).json({ message: 'File path is not set' });
//     }

//     const params = {
//       Bucket: 'harsh45bucket',
//       Key: filePath, // Use the file path as the key to fetch the file from S3
//     };

//     s3.getObject(params, (err, data) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }  
     

//       // Now, you can pass the retrieved image data to OpenAI for generating variations
//       const imageBuffer = data.Body;
//       console.log(imageBuffer)

      

//       openai.images.createVariation({
//         image: imageBuffer, // Pass the image buffer as a readable stream
//         n: 2,
//         size: '256x256',
//       })
//         .then((image) => {
//           // Send the variations data as a response
//           res.json(image.data);
//           console.log(image.data);
//         })
//         .catch((error) => {
//           console.error(error);
//           res.status(500).json({ message: 'Error generating variations' });
//         });
//     });


//   } catch (error) {
//     console.error(error);
//   }
// });




app.listen(8000, () => {
  console.log('app is running on port 8000');
});
