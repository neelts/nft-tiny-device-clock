import * as fs from "fs";
import {exec} from "child_process";

const read = (path: string) => fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '';

fs.writeFileSync(
	'build/clock.js', `document.body.innerHTML += \`${read('clock.svg')}\`\n${read('clock.js')}`
);

exec('uglifyjs build/clock.js -c -m -o build/clock.js');