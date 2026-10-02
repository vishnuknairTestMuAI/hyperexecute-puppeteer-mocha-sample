// clear the stale Chrome profile lock shipped in the linux VM image (no-op on mac and win)
const fs = require('fs');
const path = require('path');

const profileDir = '/home/ltuser/.config/google-chrome';
if (process.platform === 'linux' && fs.existsSync(profileDir)) {
	for (const file of fs.readdirSync(profileDir)) {
		if (file.startsWith('Singleton')) fs.rmSync(path.join(profileDir, file), { force: true });
	}
}
