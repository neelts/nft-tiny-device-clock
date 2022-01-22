/**
 *
 *        Tiny Devices #A: Calc
 *        Fully functional generative calculators for FxHash
 *        Author: @neelts
 *        Twitter: https://twitter.com/neelts
 *
 */

const SVG = "http://www.w3.org/2000/svg";

const get = (id: string): SVGElement | HTMLElement | unknown => document.getElementById(id);

const root = <SVGSVGElement>document.getElementsByTagNameNS(SVG, 'svg')[0];

const chars = {
	'a': '--+---++--++++--+-+-+---',
	'b': '-+-+--+-+-+-+-+-+-+--+-+',
	'c': '---+-+----+-----+-+-+---',
	'd': '-+-+--++--+--+--+-+--+-+',
	'e': '++----+---+++---+----+++',
	'f': '------+---+++---+----+++',
	'g': '---+-+-+--++----+-+-+---',
	'h': '--+---++--++++--++---+--',
	'i': '++--+--------------+--++',
	'j': '---+-+-+-----+---+----++',
	'k': '--+---+-+-+-+-+-++---+--',
	'l': '++----+---+-----+----+--',
	'm': '--+---++--+--+++++---+--',
	'n': '--+---+++-+--+-+++---+--',
	'o': '---+-+-+--+--+--+-+-+---',
	'p': '------+---+-+-+-+-+--+-+',
	'q': '+--+-+-+--+--+--+-+-+---',
	'r': '--+---+-+-+-+-+-+-+--+-+',
	's': '---+-+--+------+--+-+---',
	't': '----+--------------+--++',
	'u': '+-+--+-+--+--+--++---+--',
	'v': '---+-+-+--+--+--++---+--',
	'w': '--+---+++++--+--++---+--',
	'x': '--+---+-++----++-+---+--',
	'y': '----+---------++-+---+--',
	'z': '++----+--+----+--+----++',
	'.': '---+-+--++--------------',
	'^': '--------------++--+-+---',
	'+': '++-+-+--++-++-----+-+---',
	'-': '++-+-+--++-++-----------',
	'*': '++------++--------+-+---',
	'0': '---+-+-+-++--++-+-+-+---',
	'1': '++--+--------------+---+',
	'2': '++----+--+----+---+-+---',
	'3': '---+-+--+-----+---+-+---',
	'4': '--+----+---+-+-+-+---+--',
	'5': '-+-+----+---+---+----+++',
	'6': '---+-+--+++-----+-+-+---',
	'7': '------+--+----+--+----++',
	'8': '---+-+--++----++--+-+---',
	'9': '---+-+-+-----+++--+-+---',
	'~': '------------------------'
}

class Char {

	private readonly segments: SVGPathElement[] = [];

	constructor(char: SVGGElement) {
		const ps = char.getElementsByTagName('path');
		for (let i = 0; i < ps.length; i++) {
			const s = ps.item(i);
			this.segments.push(s);
		}
	}

	set(c: string) {
		for (let i = 0; i < this.segments.length; i++) {
			this.segments[i].setAttribute(
				'opacity', chars[c][i] === '+' ? '1' : '.1'
			);
		}
	}

}

class Chars {

	readonly count: number;
	private readonly chars: Char[];
	private readonly d: number;
	private value: string = null;
	private prev: string = null;

	constructor(id: string) {

		const chars = <SVGGElement>get(id);

		const isGroup = (node): node is SVGGElement => node.nodeName === 'g';

		this.chars = [];
		chars.childNodes.forEach(value => {
			if (isGroup(value))
				this.chars.push(new Char(value));
		});
		this.count = this.chars.length;
		this.d = 10 ** this.count;
		this.set('');
	}

	get length() {
		return this.count;
	}

	set(s: string, safe?: boolean) {

		if (this.value != s) {

			this.value = this.prev = s;

			s = s.toLowerCase().replace(/ /g, '~');
			if (safe)
				s = s.replace(/[^a-z0-9_.\-~ ]/g, '');

			if (s.length < this.count)
				s = '~'.repeat(this.count - s.length) + s;

			for (let i = 0; i < this.chars.length; i++)
				this.chars[i].set(i < s.length ? s.charAt(i) : '~');
		}
	}
}

class Control {

	readonly id: string;
	private readonly pressedClass: string = 'pressed';
	private readonly toggle: boolean;
	private readonly action: (id: string) => void;
	private readonly control: SVGGElement;
	private pressed: boolean;
	private readonly onUp: (e?: TouchEvent | MouseEvent) => void;

	private timer: number;
	private speed: number;

	constructor(id: string, action: (id: string) => void) {

		this.id = id;

		this.action = action;
		this.toggle = this.id === 'arc' || this.id === 'hyp';
		this.control = <SVGGElement>get(id);
		this.onUp = (e) => this.up(e);

		const nonPassive = {passive: false};
		this.control.classList.add('button');

		this.control.addEventListener('mousedown', (e) => this.press(e), nonPassive);
		this.control.addEventListener('touchstart', (e) => this.press(e), nonPassive);
	}

	get down(): boolean {
		return this.pressed;
	}

	press(e?: MouseEvent | TouchEvent) {

		e?.preventDefault();

		if (!this.toggle && e) {
			const nonPassive = {passive: false};
			window.addEventListener('mouseup', this.onUp, nonPassive);
			window.addEventListener('touchend', this.onUp, nonPassive);
			window.addEventListener('touchcancel', this.onUp, nonPassive);
		}

		this.pressed = !this.pressed;
		this.updateState();

		this.timer = window.setTimeout(() => this.repeat(), 500);

		this.action(this.id);
	}

	up(e?: MouseEvent | TouchEvent) {

		e?.preventDefault();

		if (!this.toggle && e) {
			window.removeEventListener('mouseup', this.onUp);
			window.removeEventListener('touchend', this.onUp);
			window.removeEventListener('touchcancel', this.onUp);
		}

		this.control.classList.remove(this.pressedClass);
		this.pressed = false;

		window.clearTimeout(this.timer);
		window.clearInterval(this.timer);
		window.clearInterval(this.speed);
	}

	private repeat() {
		this.restart();
		this.speed = window.setInterval(() => {
			this.restart();
		}, 1000);
	}

	private restart() {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(() => this.repeater(), 100);
	}

	private repeater() {
		this.action(this.id);
	}

	private updateState() {
		this.pressed ? this.control.classList.add(this.pressedClass) : this.control.classList.remove(this.pressedClass);
	}

}

enum ClockMode {
	Time,
	AlarmHours,
	AlarmSound,
	AlarmMinutes,
	AlarmOnOff,
	AlarmType,
	Count,
}

enum AlarmType {
	Once,
	Work,
	All,
}

declare function zzfx(...params): void;

type Sound = {
	volume: number, randomness: number, frequency: number,
	attack: number, sustain: number, release: number,
	shape: number, shapeCurve: number,
	slide: number, deltaSlide: number,
	pitchJump: number, pitchJumpTime: number,
	repeatTime: number, noise: number, modulation: number,
	bitCrush: number, delay: number, sustainVolume: number,
	decay: number, tremolo: number
}

const sound = (
	volume = 1, randomness = .05, frequency = 220,
	attack = 0, sustain = 0, release = .1,
	shape = 0, shapeCurve = 1,
	slide = 0, deltaSlide = 0,
	pitchJump = 0, pitchJumpTime = 0,
	repeatTime = 0, noise = 0, modulation = 0,
	bitCrush = 0, delay = 0, sustainVolume = 1,
	decay = 0, tremolo = 0
) => <Sound>({
	volume, randomness, frequency,
	attack, sustain, release,
	shape, shapeCurve,
	slide, deltaSlide,
	pitchJump, pitchJumpTime,
	repeatTime, noise, modulation,
	bitCrush, delay, sustainVolume,
	decay, tremolo
});

const randomSound = (lengthScale = 1, volume = 1, randomness = .1): Sound => {

	const R = () => Math.random(), C = () => R() < .5 ? R() : 0, S = () => C() ? 1 : -1,
		attack = R() ** 3 / 4 * lengthScale,
		decay = R() ** 3 / 4 * lengthScale,
		sustain = R() ** 3 / 4 * lengthScale,
		release = R() ** 3 / 4 * lengthScale,
		length = attack + decay + sustain + release;

	const s = sound(
		volume, randomness, R() ** 2 * 2e3,
		attack, sustain, release,
		R() * 5 | 0, R() ** 2 * 3,
		C() ** 3 * 99 * S(), C() ** 3 * 99 * S(),
		C() ** 2 * 1e3 * S(), R() ** 2 * length,
		C() * length, C() ** 4, R() * C() ** 3 * 500 * S(),
		C() ** 4, C() ** 3 / 2, 1 - C(),
		decay, C() ** 4
	);

	if (!s.pitchJumpTime || !s.pitchJump)
		s.pitchJumpTime = s.pitchJump = 0;

	if (s.repeatTime > length)
		s.repeatTime = 0;

	const fixed = (v, l = 2) => {
		if (v > 10 || v < -10)
			l = 0;
		const f = v.toFixed(l);
		return !parseFloat(f) ? '0' : f;
	}

	if (typeof s.frequency != 'string')
		s.frequency = fixed(s.frequency, 0);

	s.shapeCurve = fixed(s.shapeCurve);
	s.attack = fixed(s.attack);
	s.sustain = fixed(s.sustain);
	s.release = fixed(s.release);
	s.slide = fixed(s.slide, 1);
	s.deltaSlide = fixed(s.deltaSlide, 1);
	s.noise = fixed(s.noise, 1);
	s.pitchJump = fixed(s.pitchJump, 0);
	s.pitchJumpTime = fixed(s.pitchJumpTime);
	s.repeatTime = fixed(s.repeatTime, 2);
	s.modulation = fixed(s.modulation, 1);
	s.bitCrush = fixed(s.bitCrush, 1);
	s.delay = fixed(s.delay);
	s.sustainVolume = fixed(s.sustainVolume);
	s.decay = fixed(s.decay);
	s.tremolo = fixed(s.tremolo);

	return s;
}

const defaultSound = sound();

const soundToArray = (sound: Sound) => {
	const array = [];
	for (const key in defaultSound)
		array.push(sound[key]);
	return array;
}

const playSound = (sound: Sound) => {
	zzfx(...soundToArray(sound));
}

const storage = window.localStorage;

const getInt = (name: string): number => {
	const value = parseInt(storage.getItem(name));
	return isNaN(value) ? 0 : (value ?? 0);
}

class Clock {

	hours: number;
	minutes: number;

	alarm: boolean;
	type: AlarmType;

	sound: Sound;

	last: boolean;
	playing: boolean;
	muted: boolean;

	constructor(update: (h: number, m: number, s: number, f: number) => ClockMode) {
		window.setInterval(() => {
			const d = new Date(Date.now());
			const mode = update(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
			if (this.alarm && mode === ClockMode.Time && this.type !== AlarmType.Work || (d.getDay() > 0 && d.getDay() < 6)) {
				if (this.hours == d.getHours() && this.minutes == d.getMinutes()) {
					if (!this.muted) {
						const l = d.getMilliseconds() > 500;
						if (this.last != l)
							this.play();
						this.last = l;
						this.playing = true;
					}
				} else {
					this.mute();
					this.muted = false;
				}
			}
		}, 1e3 / 60);

		this.hours = getInt('hours');
		this.minutes = getInt('minutes');
		this.alarm = getInt('alarm') > 0;
		this.type = getInt('type');
		this.sound = JSON.parse(storage.getItem('sound')) ?? randomSound();

		this.save();
	}

	get typeNum(): string {
		switch (this.type) {
			case AlarmType.Once:
				return '1';
			case AlarmType.Work:
				return '5';
			case AlarmType.All:
				return '7';
		}
	}

	random() {
		this.sound = randomSound();
		this.play();
	}

	save() {
		storage.setItem('hours', `${this.hours}`);
		storage.setItem('minutes', `${this.minutes}`);
		storage.setItem('alarm', `${this.alarm ? 1 : 0}`);
		storage.setItem('type', `${this.type}`);
		storage.setItem('sound', `${JSON.stringify(this.sound)}`);
	}

	play() {
		playSound(this.sound);
	}

	mute() {
		if (this.playing && this.type === AlarmType.Once) {
			this.alarm = false;
			storage.setItem('alarm', '0');
		}
		this.muted = true;
		this.playing = false;
	}
}

class Device {

	private readonly time: Chars;
	private readonly frame: Chars;

	private mode: ClockMode = ClockMode.Time;

	private readonly clock: Clock;

	private readonly controls: Map<string, Control>;

	private reset: number = 0;
	private timeout: number;
	private save: number;

	constructor() {

		this.time = new Chars('time');
		this.frame = new Chars('frame');

		const dg = (n: number) => {
			return `${'0'.repeat(2 - `${n}`.length)}${n}`;
		}

		this.clock = new Clock((h: number, m: number, s: number, f: number): ClockMode => {
			const b = (f % 500 > 250) && ((Date.now() - this.reset) > 500);
			switch (this.mode) {
				case ClockMode.Time: {
					this.time.set(`${dg(h)}${s % 2 > 0 ? '^' : '.'}${dg(m)}`);
					this.frame.set(this.clock.playing && b ? '~~' : `g${h >= 18 ? 'e' : (h >= 12 ? 'a' : (h >= 6 ? 'm' : 'n'))}`);
					break;
				}
				case ClockMode.AlarmHours:
				case ClockMode.AlarmSound:
				case ClockMode.AlarmMinutes:
				case ClockMode.AlarmOnOff:
				case ClockMode.AlarmType: {
					const ch = dg(this.clock.hours);
					const cm = dg(this.clock.minutes);
					this.time.set(`${
						this.mode === ClockMode.AlarmHours && b ? '~~' : ch
					}${
						this.mode === ClockMode.AlarmSound ? (b ? '~' : '*') : '.'
					}${
						this.mode === ClockMode.AlarmMinutes && b ? '~~' : cm
					}`);
					this.frame.set(`${
						this.mode === ClockMode.AlarmOnOff && b ? '~' : (this.clock.alarm ? '+' : '-')
					}${
						this.mode === ClockMode.AlarmType && b ? '~' : (this.clock.typeNum)
					}`);
				}
			}
			return this.mode;
		});

		this.controls = new Map();

		const create = (e: Element) => {
			const control = new Control(e.id, (id) => this.command(id));
			this.controls.set(control.id, control);
		};

		const basic = <SVGGElement>get('actions');
		for (const button of basic.children)
			create(button);

		const keys = new Map<string, string>([
			['KeyZ', 'left'], ['ArrowLeft', 'left'], ['BracketLeft', 'left'], ['Comma', 'left'],
			['KeyX', 'right'], ['ArrowRight', 'right'], ['BracketRight', 'right'], ['Period', 'right'],
		]);

		const getControl = (e) => {
			if (keys.has(e.code))
				return this.controls.get(keys.get(e.code));
			return null;
		}

		window.addEventListener('keydown', (e) => {
			const control = getControl(e);
			if (control && !control.down) {
				e.preventDefault();
				control.press();
			}
		});

		window.addEventListener('keyup', (e) => {
			const control = getControl(e);
			if (control && control.down) {
				control.up();
				e.preventDefault();
			}
			let controlBase = getControl(e);
			if (controlBase && controlBase.down) {
				e.preventDefault();
				controlBase.up();
			}
			controlBase = getControl(e);
			if (controlBase && controlBase.down) {
				e.preventDefault();
				controlBase.up();
			}
		});
	}

	private command(id: string) {

		if (this.clock.playing) {
			this.clock.mute();
			return;
		}

		switch (id) {
			case 'left': {
				this.mode++;
				if (this.mode >= ClockMode.Count)
					this.mode = ClockMode.Time;
				if (this.mode === ClockMode.AlarmSound)
					this.clock.play();
				break;
			}
			case 'right': {
				this.reset = Date.now();
				switch (this.mode) {
					case ClockMode.AlarmHours: {
						this.clock.hours++;
						if (this.clock.hours > 23)
							this.clock.hours = 0;
						this.clock.alarm = true;
						break;
					}
					case ClockMode.AlarmSound: {
						this.clock.random();
						break;
					}
					case ClockMode.AlarmMinutes: {
						this.clock.minutes++;
						if (this.clock.minutes > 59)
							this.clock.minutes = 0;
						this.clock.alarm = true;
						break;
					}
					case ClockMode.AlarmOnOff: {
						this.clock.alarm = !this.clock.alarm;
						if (this.clock.alarm)
							this.clock.play();
						break;
					}
					case ClockMode.AlarmType: {
						this.clock.type++;
						if (this.clock.type > AlarmType.All)
							this.clock.type = AlarmType.Once;
						break;
					}
				}
				break;
			}
		}

		window.clearTimeout(this.timeout);
		if (this.mode !== ClockMode.Time) {
			this.timeout = window.setTimeout(() => {
				this.mode = ClockMode.Time;
			}, 10000);
		}

		window.clearTimeout(this.save);
		this.save = window.setTimeout(() => this.clock.save(), 1000);
	}
}

new Device();