export default {
  default: {
    paths: ['features/**/*.feature'],
    import: ['features/step_definitions/**/*.js'],
    format: ['progress-bar'],
    worldParameters: {
      headless: true
    }
  }
};