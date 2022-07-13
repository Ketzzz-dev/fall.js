/** @type {import("snowpack").SnowpackUserConfig} */
export default {
    mount: {
        public: { url: '/', static: true },
        src: { url: '/dist' },
    },
    plugins: [
        ['@snowpack/plugin-typescript']
    ],
    optimize: {
        bundle: true,
        minify: true,
        sourcemap: true
    },
    alias: {
        '@Core': './src/Core',
        '@Display': './src/Display',
        '@FMath': './src/FMath',
        '@Physics': './src/Physics',
        '@Geometry': './src/Geometry',
        '@Util': './src/Util',
    },
    optimize: {
        bundle: true,
        minify: true,
        sourcemap: true
    }
};