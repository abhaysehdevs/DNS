import fs from 'fs';
import path from 'path';

const historyPath = path.join(process.env.APPDATA, 'Microsoft/Windows/PowerShell/PSReadLine/ConsoleHost_history.txt');

if (!fs.existsSync(historyPath)) {
    console.log('History file does not exist at:', historyPath);
    process.exit(1);
}

const content = fs.readFileSync(historyPath, 'utf8');
const lines = content.split('\n');

console.log('Total history lines:', lines.length);

lines.forEach((line, idx) => {
    if (line.includes('Bearer') || line.includes('/projects/') || line.includes('service_role') || line.includes('rdothiiv')) {
        console.log(`\n--- Match at line ${idx} ---`);
        const start = Math.max(0, idx - 5);
        const end = Math.min(lines.length, idx + 8);
        for (let i = start; i < end; i++) {
            console.log(`${i}: ${lines[i]}`);
        }
    }
});
