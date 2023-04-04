// Import required modules
const express = require("express");
const multer = require("multer");
const JSZip = require("jszip");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// Initialize app and configure multer
const app = express();
const upload = multer({ dest: "uploads/" });

// Serve the upload form
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Theme File Uploader</title>
    </head>
    <body>
        <h1>Emergency Luminous Theme Patcher for April 4th Glitch</h1>
        <p>As of today, there is an ongoing outage with a CDN responsible for loading the scroll effects library for our themes due to a DDOS cyberattack. 
        This causes website content to be invisible for some websites running on our themes. Please use this online tool to rapidly
        fix this bug with the theme and apply an emergency patch. Your website content will not be lost. This will disable scroll animations until we get the issue resolved, but it will ensure
        that your website content remains visible. This tool makes changes to your Weebly theme file. Please follow the instructions below. 
        </p>
        <p>1. Go into the Weebly builder of the affected website. </p>
        <p>2. Click on the "Theme" tab. </p>
        <p>3. Click on "Edit HTML/CSS". </p>
        <p>4. The code editor window should open up. In the lower left-hand corner, there should be an "export theme" button. Click it. </p>
        <p>5. Your theme file will now be downloaded to your computer as a .zip file. Do not extract it. keep it as a .zip file. </p>
        <p>6. Click on the "upload" button below, and upload your downloaded .zip theme file. Upload it.  </p>
        <p>7. This tool will automatically save to your computer a file called "updated.zip". This is your new theme file with the corrections to ensure that content remains visible. You can rename it if you'd like. </p>
        <p>8. Upload this new downloaded .zip onto your current Weebly website, by doing the following: </p>
        <p>9. Go back to Weebly, go to "Theme", go to "Change Theme", and click on import custom theme. Import the *updated* theme file that this tool downloaded to your computer. </p>
        <p>10. Publish website. </p>
        <p>Your content should now be visible on the published website. If it is not, please contact us immediately. </p>

        <div style="padding: 10px; background-color: black; color: white; margin-bottom: 40px; ">Theme Fix Tool Below</div>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="zipfile" accept=".zip" required>
            <button type="submit">Upload</button>
        </form>
    </body>
    </html>
  `);
});

// Route for file upload
app.post("/upload", upload.single("zipfile"), async (req, res) => {
  try {
    // Read the uploaded ZIP file
    const zipFileBuffer = fs.readFileSync(req.file.path);
    const zip = await JSZip.loadAsync(zipFileBuffer);

    // Iterate through the files in the ZIP
    for (const fileName in zip.files) {
      if (path.extname(fileName) === ".html") {
        // Read the HTML file, parse it with Cheerio and remove the specified tag
        const fileContent = await zip.file(fileName).async("text");
        const $ = cheerio.load(fileContent);
        $('link[href="https://unpkg.com/aos@2.3.1/dist/aos.css"]').remove();

        // Update the HTML file in the ZIP
        zip.file(fileName, $.html());
      }
    }

    // Generate the updated ZIP file and send it as a response
    const outputZipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=updated.zip");
    res.send(outputZipBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the ZIP file.");
  } finally {
    // Delete the uploaded file
    fs.unlinkSync(req.file.path);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
