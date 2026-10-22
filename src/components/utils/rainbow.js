// Replaces the rainbow-colors-array package (hex mode only), whose implicit globals
// throw in strict-mode bundles. Returns `length` colors as [{ hex: "rrggbb" }, ...].
export function hexRainbow(length, pastel = false) {
	const [amplitude, center] = pastel ? [55, 200] : [127, 128];
	const frequency = (Math.PI * 2) / length;
	const channel = (i, phase) => Math.round(Math.sin(frequency * i + phase) * amplitude + center);
	const colors = [];
	for (let i = 0; i < length; i++) {
		const rgb = (1 << 24) + (channel(i, 2) << 16) + (channel(i, 0) << 8) + channel(i, 4);
		colors.push({ hex: rgb.toString(16).slice(1) });
	}
	return colors;
}
