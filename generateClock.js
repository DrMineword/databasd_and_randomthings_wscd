const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const simpleGit = require('simple-git');
const git = simpleGit();

// Setup git repository and commit configuration
const repoDir = path.resolve(__dirname);
const outputDir = path.join(repoDir, 'generated_gifs');  // Folder where GIFs will be saved

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const generateGIF = (hour, minute) => {
    return new Promise((resolve, reject) => {
        const canvas = createCanvas(200, 100);
        const ctx = canvas.getContext('2d');
        const encoder = new GIFEncoder(200, 100);
        const fileName = `${hour.toString().padStart(2, '0')}/${minute.toString().padStart(2, '0')}.gif`;
        const folder = path.join(outputDir, hour.toString().padStart(2, '0'));

        // Ensure the folder exists
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        encoder.createReadStream().pipe(fs.createWriteStream(path.join(folder, fileName)));

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
        resolve();
    });
};

const pushToGitHubWithRetry = async (maxRetries = 5, delay = 2000) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            console.log(`Attempting to push to GitHub (Attempt ${attempt + 1})...`);

            // Stage all changes
            await git.add('./*');

            // Commit changes
            await git.commit(`Add clock GIFs for 24 hours`);

            // Push to GitHub
            await git.push('origin', 'gif-generation');
            
            console.log("GIFs successfully pushed to GitHub!");
            return;
        } catch (error) {
            attempt++;
            console.error(`Error pushing to GitHub (Attempt ${attempt}): ${error.message}`);
            
            if (attempt < maxRetries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));  // wait before retrying
            } else {
                console.log("Max retries reached. Push failed.");
            }
        }
    }
};

const generateAndPushGIFs = async () => {
    try {
        // Generate all 1440 GIFs (60 minutes * 24 hours)
        let total = 0;
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute++) {
                await generateGIF(hour, minute);
                total++;
                console.log(`Generated ${total}/1440: ${hour}:${minute.toString().padStart(2, '0')}`);
            }
        }

        // Retry pushing GIFs to GitHub
        console.log("All GIFs generated. Attempting to push to GitHub...");
        await pushToGitHubWithRetry();

    } catch (error) {
        console.error("Error generating GIFs:", error);
    }
};

// Start the GIF generation and push
generateAndPushGIFs();
