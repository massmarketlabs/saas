export default defineAppConfig({
  // https://ui3.nuxt.dev/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'cyan',
      neutral: 'slate'
    },
    skeleton: {
      base: 'animate-pulse rounded-md bg-elevated'
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    }
  }
})
