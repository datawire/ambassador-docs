const path = require('path');

exports.onCreateWebpackConfig = ({ actions, stage, getConfig }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@src': path.resolve(__dirname),
      },
    },
  });

  if (stage === 'build-javascript' || stage === 'develop') {
    //https://github.com/webpack-contrib/mini-css-extract-plugin#remove-order-warnings
    const config = getConfig();
    const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin',
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true;
    }
    actions.replaceWebpackConfig(config);
  }
};
