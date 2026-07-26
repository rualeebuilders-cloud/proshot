const fs = require('fs');
const src = '/Users/rua/.gemini/antigravity-ide/brain/9d24812b-a8a9-4cf9-a585-9316698c9970/artistic_natural_instagram_v2_1784973985681.png';
const dest = 'public/examples/global_artistic_after.png';
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied clean artistic image to public/examples/global_artistic_after.png');
}
