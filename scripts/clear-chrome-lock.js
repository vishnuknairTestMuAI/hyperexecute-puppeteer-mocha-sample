// clear the stale Chrome profile lock left in the linux VM image (no-op on mac and win)
const fs = require('fs');
const os = require('os');
const path = require('path');

const profileDir = path.join(os.homedir(), '.config', 'google-chrome');
if (process.platform === 'linux' && fs.existsSync(profileDir)) {
	for (const file of fs.readdirSync(profileDir)) {
		if (file.startsWith('Singleton')) fs.rmSync(path.join(profileDir, file), { force: true });
	}
}
