/** @type {import('@storybook/web-components-vite').StorybookConfig} */
const config = {
  stories: ["../components/**/*.stories.js"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  addons: ["@storybook/addon-a11y"],
};

export default config;
