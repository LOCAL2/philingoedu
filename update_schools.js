const fs = require('fs');

function updateFile(filePath) {
  let f = fs.readFileSync(filePath, 'utf8');
  // First, let's make sure SchoolEntry type has image? string;
  f = f.replace(/type SchoolEntry = \{([^}]+)\};/, (m, inner) => {
    if (!inner.includes('image?: string')) {
      return `type SchoolEntry = {${inner}, image?: string };`;
    }
    return m;
  });
  
  f = f.replace(/slug:\s*'([^']+)'/g, (m, slug) => {
    // avoid double adding
    if (m.includes('image:')) return m;
    const ext = slug === 'genius-english' ? 'png' : 'jpg';
    return `${m}, image: '/schools/${slug}.${ext}'`;
  });
  
  // also change how it renders the image
  f = f.replace(/<img src=\{CITY_PHOTO\[school\.city\] \?\? cebuImg\} alt=\{school\.name\} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" \/>/g, 
  `<img src={school.image ?? (CITY_PHOTO[school.city] ?? cebuImg)} alt={school.name} onError={(e) => { e.currentTarget.src = CITY_PHOTO[school.city] ?? cebuImg; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />`);
  
  fs.writeFileSync(filePath, f);
  console.log('Updated ' + filePath);
}

updateFile('artifacts/philingo/src/pages/Schools.tsx');
