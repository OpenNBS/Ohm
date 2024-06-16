// adapted from https://stackoverflow.com/a/66390028

interface Format {
	"unit": Intl.RelativeTimeFormatUnit,
	"milliseconds": number
}

const formats: Format[] = [
	{
		"unit": "year",
		"milliseconds": 31536000000
	},
	{
		"unit": "month",
		"milliseconds": 2628000000
	},
	{
		"unit": "day",
		"milliseconds": 86400000
	},
	{
		"unit": "hour",
		"milliseconds": 3600000
	},
	{
		"unit": "minute",
		"milliseconds": 60000
	},
	{
		"unit": "second",
		"milliseconds": 1000
	}
];

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
	"style": "long"
});

export function formatRelative(elapsed: number): string {
	for (const { unit, milliseconds } of formats) {
		if (elapsed >= milliseconds) {
			return relativeTimeFormat.format(Math.round(elapsed / milliseconds), unit);
		}
	}

	return `${elapsed} milliseconds`;
}
