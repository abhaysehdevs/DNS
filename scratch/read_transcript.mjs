import fs from 'fs';
import path from 'path';

const logDir = 'C:/Users/pc/.gemini/antigravity-ide/brain/95263b7c-a195-4135-9edb-d04182d050ab/.system_generated/logs';
const transcriptPath = path.join(logDir, 'transcript_full.jsonl');

if (!fs.existsSync(transcriptPath)) {
    console.log('Transcript file does not exist at:', transcriptPath);
    process.exit(1);
}

const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

console.log('Total transcript lines:', lines.length);

lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
        const obj = JSON.parse(line);
        const str = JSON.stringify(obj);
        if (str.includes('password') || str.includes('service_role') || str.includes('site_settings') || str.includes('sql') || str.includes('migration')) {
            // Print brief details
            console.log(`\nLine ${idx} (${obj.source} - ${obj.type}):`);
            if (obj.content) {
                console.log('Content snippet:', obj.content.substring(0, 300));
            }
            if (obj.tool_calls) {
                console.log('Tool calls:', JSON.stringify(obj.tool_calls));
            }
        }
    } catch (e) {
        console.error(`Error parsing line ${idx}:`, e.message);
    }
});
