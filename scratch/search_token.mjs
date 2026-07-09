import fs from 'fs';
import path from 'path';

const searchDirs = [
    process.env.USERPROFILE,
    path.join(process.env.USERPROFILE, 'AppData/Roaming'),
    path.join(process.env.USERPROFILE, 'AppData/Local'),
    path.join(process.env.USERPROFILE, 'Documents')
];

console.log('Searching for sbp_ tokens in user profile...');

const scannedFiles = [];
const matches = [];

function scanDir(dir, depth = 0) {
    if (depth > 3) return; // Limit depth to prevent infinite loops / slow down
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (e) {
                continue;
            }
            if (stat.isDirectory()) {
                // Skip large node_modules or system directories
                if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'AppData' || file === 'Microsoft' || file === 'Programs') {
                    if (depth > 0) continue; // Allow AppData subdirectories specified in searchDirs
                }
                scanDir(fullPath, depth + 1);
            } else if (stat.isFile()) {
                // Only scan text-like files and configuration files
                const ext = path.extname(file).toLowerCase();
                const isConfig = file.startsWith('.') || ext === '.json' || ext === '.txt' || ext === '.env' || ext === '.local' || ext === '.yml' || ext === '.yaml' || ext === '.toml';
                if (isConfig && stat.size < 100000) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        if (content.includes('sbp_')) {
                            console.log(`FOUND sbp_ in file: ${fullPath}`);
                            matches.push({ file: fullPath, content });
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (e) {}
}

searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        scanDir(dir);
    }
});

console.log(`Scan completed. Found ${matches.length} matches.`);
