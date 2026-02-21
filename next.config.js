/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import createNextIntlPlugin from "next-intl/plugin";
import "./src/env.js";

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const config = {
    turbopack: {
        root: process.env.TURBOPACK_ROOT || './',
    }
};

export default withNextIntl(config);
