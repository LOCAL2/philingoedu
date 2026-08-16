import fs from 'fs';
import path from 'path';

async function run() {
  const publicSchoolsDir = path.join('C:\\Users\\Woradet\\Documents\\philingoedu\\artifacts\\philingo\\public\\schools');
  if (!fs.existsSync(publicSchoolsDir)) {
    fs.mkdirSync(publicSchoolsDir, { recursive: true });
  }

  const r = await fetch('https://4263ec37-dbf5-4f49-9f32-029a2a590bef-00-lkz2fetr2su2.pike.replit.dev/api/schools?limit=100');
  const data = await r.json();
  const schools = data.data || data;

  const schoolImageMap = {};

  for (const school of schools) {
    if (school.photos && school.photos.length > 0) {
      let photoUrl = school.photos[0];
      if (photoUrl.startsWith('/')) {
        photoUrl = 'https://4263ec37-dbf5-4f49-9f32-029a2a590bef-00-lkz2fetr2su2.pike.replit.dev' + photoUrl;
      }
      try {
        console.log(`Downloading ${photoUrl} for ${school.slug}...`);
        const imgRes = await fetch(photoUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          // detect extension
          let ext = '.jpg';
          if (photoUrl.includes('.png')) ext = '.png';
          else if (photoUrl.includes('.webp')) ext = '.webp';
          
          const filename = `${school.slug}${ext}`;
          const filepath = path.join(publicSchoolsDir, filename);
          fs.writeFileSync(filepath, Buffer.from(buffer));
          schoolImageMap[school.slug] = `/schools/${filename}`;
        }
      } catch (err) {
        console.error(`Failed to download for ${school.slug}:`, err);
      }
    }
  }

  console.log('Finished downloading images.');
  console.log(JSON.stringify(schoolImageMap, null, 2));
}

run();
