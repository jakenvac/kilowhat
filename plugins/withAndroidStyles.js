const { withAndroidStyles } = require('@expo/config-plugins');

/**
 * Set Android app window background color to prevent white flash
 */
module.exports = function withCustomAndroidStyles(config) {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;
    
    // Find the AppTheme style
    const appThemeIndex = styles.resources.style.findIndex(
      style => style.$.name === 'AppTheme'
    );
    
    if (appThemeIndex !== -1) {
      // Add windowBackground color to AppTheme
      styles.resources.style[appThemeIndex].item.push({
        $: { name: 'android:windowBackground' },
        _: '#111111'
      });
    }
    
    return config;
  });
};
