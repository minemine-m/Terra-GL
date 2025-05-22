import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		dts({
			outDir: ["./dist"],
			rollupTypes: true,
		}),
	],
	build: {
		target: "es2020",
		outDir: "./dist",
		lib: {
			entry: "./src/index.ts",
			name: "terra-gl",
			fileName: "index",
		},
		rollupOptions: {
			external: ["three"],
			output: {
				// inlineDynamicImports: true, // 将动态导入的内容内联
				globals: {
					three: "THREE",
				},
			},
		},
		// sourcemap: true,
	},
});
