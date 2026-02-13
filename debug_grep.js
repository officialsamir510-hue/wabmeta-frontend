const fs = require('fs');

try {
    const content = fs.readFileSync('c:\\Users\\Sameer Thakur\\OneDrive\\WabMeta\\src\\pages\\Inbox.tsx', 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('accountId')) {
            console.log(`${index + 1}: ${line}`);
        }
    });
} catch (err) {
    console.error(err);
}
