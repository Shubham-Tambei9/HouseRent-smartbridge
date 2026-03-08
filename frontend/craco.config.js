const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Suppress the react-datepicker critical dependency warning
            webpackConfig.ignoreWarnings = [
                ...(webpackConfig.ignoreWarnings || []),
                {
                    module: /react-datepicker/,
                    message: /Critical dependency: the request of a dependency is an expression/,
                },
            ];
            return webpackConfig;
        },
    },
};
