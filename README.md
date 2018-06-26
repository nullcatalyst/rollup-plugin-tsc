# rollup-plugin-tsc

A small [Rollup](https://github.com/rollup/rollup) plugin for transpiling Typescript.

## Installation
```
npm install --save-dev rollup-plugin-tsc
```

## Usage
```js
// rollup.config.js
import tsc from "rollup-plugin-tsc";

// [optional] If a specific version of typescript is required
import typescript from "typescript";

export default {
	input: "src/main.ts",

	plugins: [
		tsc(
			// Put your tsconfig here
			Object.assign({},
				require("./tsconfig.json"),

				// [optional] Pass your specific version of typescript as a second parameter
				{ typescript }
			)

			// [note] You can also create the tsconfig options directly
			//        (useful for changing settings between debug/production builds)
			// { /* ... */ }
		),
	]
};
```
The plugin simply transpiles Typescript into Javascript. To configure the Typescript compiler, the [tsconfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) has to be passed to the plugin. It is not necessary to hold a separate `tsconfig.json` file in the project, but still possible as some IDEs provide more meaningful suggestions when such a file does exist.
