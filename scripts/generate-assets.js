const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const samplesDir = path.join(__dirname, '..', 'public', 'samples');
  fs.mkdirSync(samplesDir, { recursive: true });

  // 1. Generate a professional default CES Certificate template background (1920x1080)
  const certSvg = `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fafbfd" />
          <stop offset="50%" stop-color="#f4f7fb" />
          <stop offset="100%" stop-color="#edf2f7" />
        </linearGradient>
        <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e3a8a" />
        </linearGradient>
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706" />
          <stop offset="25%" stop-color="#fef08a" />
          <stop offset="50%" stop-color="#b45309" />
          <stop offset="75%" stop-color="#fde047" />
          <stop offset="100%" stop-color="#92400e" />
        </linearGradient>
      </defs>

      <!-- Clean Background Canvas -->
      <rect width="1920" height="1080" fill="url(#bgGrad)" />

      <!-- Geometric Accent Corner Accents -->
      <polygon points="0,0 350,0 0,350" fill="#1e3a8a" opacity="0.08" />
      <polygon points="0,0 240,0 0,240" fill="#2563eb" opacity="0.12" />
      <polygon points="1920,1080 1570,1080 1920,730" fill="#1e3a8a" opacity="0.08" />
      <polygon points="1920,1080 1680,1080 1920,840" fill="#2563eb" opacity="0.12" />

      <!-- Outer Double Border -->
      <rect x="40" y="40" width="1840" height="1000" rx="12" fill="none" stroke="#0f172a" stroke-width="5" />
      <rect x="52" y="52" width="1816" height="976" rx="8" fill="none" stroke="url(#goldBorder)" stroke-width="4" />
      <rect x="62" y="62" width="1796" height="956" rx="6" fill="none" stroke="#1e3a8a" stroke-width="1.5" opacity="0.5" />

      <!-- Corner Corner Ornaments -->
      <rect x="75" y="75" width="60" height="4" fill="#d97706" />
      <rect x="75" y="75" width="4" height="60" fill="#d97706" />
      <rect x="1785" y="75" width="60" height="4" fill="#d97706" />
      <rect x="1841" y="75" width="4" height="60" fill="#d97706" />
      <rect x="75" y="1001" width="60" height="4" fill="#d97706" />
      <rect x="75" y="945" width="4" height="60" fill="#d97706" />
      <rect x="1785" y="1001" width="60" height="4" fill="#d97706" />
      <rect x="1841" y="945" width="4" height="60" fill="#d97706" />

      <!-- Club Crest & Header -->
      <g transform="translate(960, 145)" text-anchor="middle">
        <text y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" letter-spacing="8" fill="#d97706">DEPARTMENT OF COMPUTER ENGINEERING</text>
        <text y="48" font-family="'Segoe UI', Roboto, Montserrat, sans-serif" font-size="44" font-weight="900" letter-spacing="4" fill="#0f172a">COMPUTER ENGINEERS' SOCIETY</text>
        <text y="78" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" letter-spacing="6" fill="#475569">AFFILIATED TECHNICAL STUDENT CHAPTER</text>
        
        <!-- Divider with Star -->
        <line x1="-280" y1="105" x2="-30" y2="105" stroke="#cbd5e1" stroke-width="2" />
        <circle cx="0" cy="105" r="7" fill="#d97706" />
        <line x1="30" y1="105" x2="280" y2="105" stroke="#cbd5e1" stroke-width="2" />

        <text y="160" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-style="italic" fill="#334155">Certificate of Excellence</text>
        <text y="210" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" letter-spacing="3" fill="#64748b">THIS IS PROUDLY PRESENTED TO</text>
      </g>

      <!-- Bottom Signature Lines -->
      <g transform="translate(380, 930)">
        <line x1="-120" y1="0" x2="120" y2="0" stroke="#94a3b8" stroke-width="1.5" />
        <text x="0" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#1e293b" text-anchor="middle">Faculty Advisor</text>
        <text x="0" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Computer Engineers' Society</text>
      </g>

      <g transform="translate(960, 915)">
        <!-- Gold Official Stamp / Seal -->
        <circle cx="0" cy="0" r="50" fill="none" stroke="#d97706" stroke-width="3" stroke-dasharray="6,4" />
        <circle cx="0" cy="0" r="42" fill="#fef3c7" stroke="#b45309" stroke-width="1.5" />
        <text y="-8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#92400e" text-anchor="middle" letter-spacing="2">OFFICIAL</text>
        <text y="10" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#b45309" text-anchor="middle">★ CES ★</text>
        <text y="26" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#92400e" text-anchor="middle" letter-spacing="1">SEAL</text>
      </g>

      <g transform="translate(1540, 930)">
        <line x1="-120" y1="0" x2="120" y2="0" stroke="#94a3b8" stroke-width="1.5" />
        <text x="0" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#1e293b" text-anchor="middle">Club President</text>
        <text x="0" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">CES Executive Committee</text>
      </g>
    </svg>
  `;

  await sharp(Buffer.from(certSvg))
    .resize(1920, 1080)
    .png()
    .toFile(path.join(samplesDir, 'ces_default_certificate.png'));
  console.log('Created ces_default_certificate.png (1920x1080)');

  // Also create a sample CSV and XLSX for testing
  const sampleCsvContent = `recipient_name,event_name,date,certificate_id,position,email
Aarav Sharma,Web Development Bootcamp 2026,September 15 2026,CES-2026-001,1st Place,aarav@ces.edu
Priya Patel,AI & Machine Learning Workshop,September 15 2026,CES-2026-002,Participant,priya@ces.edu
Rohan Mehta,Annual Hackathon - CodeCraft,September 15 2026,CES-2026-003,2nd Place,rohan@ces.edu
Ananya Iyer,Cybersecurity & Ethical Hacking,September 15 2026,CES-2026-004,Volunteer,ananya@ces.edu
Vikram Singh,Cloud Computing Masterclass,September 15 2026,CES-2026-005,Participant,vikram@ces.edu
Neha Gupta,UI/UX Design Sprint,September 15 2026,CES-2026-006,Organizer,neha@ces.edu
`;
  fs.writeFileSync(path.join(samplesDir, 'ces_sample_recipients.csv'), sampleCsvContent);
  console.log('Created ces_sample_recipients.csv');
}

main().catch(console.error);
