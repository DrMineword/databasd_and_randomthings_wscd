const express = require('express');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');

const app = express();
const port = 3000;  // You can change the port if needed

// Function to generate clock GIF
const generateClockGIF = (hour, minute) => {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(200, 100);
    const ctx = canvas.getContext('2d');
    const encoder = new GIFEncoder(200, 100);
    
    encoder.start();
    encoder.setRepeat(0);  // No repeat
    encoder.setDelay(750);  // 0.75 seconds delay between frames
    encoder.setQuality(10);  // High quality

    const drawClock = (showColon) => {
      ctx.clearRect(0, 0, 200, 100);
      ctx.fillStyle = '#FFD580'; // Light orange color
      ctx.font = '80px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const colon = showColon ? ':' : ' ';
      const timeText = `${hour.toString().padStart(2, '0')}${colon}${minute.toString().padStart(2, '0')}`;
      ctx.fillText(timeText, 100, 50);
    };

    // Add frames for the GIF (blink the colon)
    for (let i = 0; i < 6; i++) {
      drawClock(i % 2 === 0);
      encoder.addFrame(ctx);
    }

    encoder.finish();
    const gifBuffer = encoder.out.getData();
    resolve(gifBuffer);
  });
};

// Public endpoint for raw GIF
app.get('/h/:hour/m/:minute/raw', async (req, res) => {
  try {
    const { hour, minute } = req.params;

    const gifBuffer = await generateClockGIF(hour, minute);

    res.setHeader('Content-Type', 'image/gif');
    res.send(gifBuffer);
  } catch (error) {
    res.status(500).send('Error generating clock GIF');
  }
});

// Public endpoint for base64 encoded GIF
app.get('/h/:hour/m/:minute/base64', async (req, res) => {
  try {
    const { hour, minute } = req.params;

    const gifBuffer = await generateClockGIF(hour, minute);
    const base64String = gifBuffer.toString('base64');

    res.send(base64String);
  } catch (error) {
    res.status(500).send('Error generating clock GIF');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
