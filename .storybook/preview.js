import "../tokens/tokens.css";

/** @type { import('@storybook/web-components-vite').Preview } */
const preview = {
  parameters: {
    controls: { expanded: true },
    a11y: {
      // Fails the story in CI/local runs on a real violation — see components/README.md and
      // design.md's Accessibility section for the rules this is checking against.
      test: "error",
    },
  },
};

export default preview;
