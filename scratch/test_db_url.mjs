import { execSync } from 'child_process';

const projectRef = 'rdothiivupbtuprwknqk';
const passwords = [
    'postgres',
    'admin123',
    'dinanath',
    'dinanath123',
    'dinanathandsons',
    'abhaytellora22@',
    'prakhartellora22@',
    'abhaysehdev',
    'abhaysehdevs',
    'abhay@123',
    'abhaysehdevofficial',
    'abhaysehdevofficial@gmail.com'
];

for (const pwd of passwords) {
    const encodedPwd = encodeURIComponent(pwd);
    // Try port 6543 (pooler) first
    const dbUrl = `postgresql://postgres:${encodedPwd}@db.${projectRef}.supabase.co:6543/postgres`;
    console.log(`Testing password: ${pwd} on port 6543...`);
    try {
        const output = execSync(`npx supabase db query --db-url "${dbUrl}" "SELECT 1;"`, { stdio: 'pipe' });
        console.log(`SUCCESS with password: ${pwd}! Output:`, output.toString());
        break;
    } catch (err) {
        const errMsg = err.stderr ? err.stderr.toString() : err.message;
        if (errMsg.includes('password authentication failed') || errMsg.includes('PgClient: Failed to connect') || errMsg.includes('connect ECONNREFUSED')) {
            // Check direct port 5432
            const dbUrlDirect = `postgresql://postgres:${encodedPwd}@db.${projectRef}.supabase.co:5432/postgres`;
            console.log(`Failed on 6543. Testing on port 5432...`);
            try {
                const outputDirect = execSync(`npx supabase db query --db-url "${dbUrlDirect}" "SELECT 1;"`, { stdio: 'pipe' });
                console.log(`SUCCESS with password: ${pwd} on 5432! Output:`, outputDirect.toString());
                break;
            } catch (errDirect) {
                console.log(`Failed on 5432:`, errDirect.stderr ? errDirect.stderr.toString().trim() : errDirect.message.trim());
            }
        } else {
            console.log(`Error:`, errMsg.trim());
        }
    }
    console.log('-------------------------------------------');
}
