// basic imports
const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin")

//main webpack configuration
module.exports = function (env = {}) {

    const NODE_ENV = process.env.NODE_ENV || 'development';
    const DEV = (NODE_ENV === 'development');
    const PROD = (NODE_ENV === 'production');

    console.log('NODE_ENV:', NODE_ENV)

    const definePluginConfig = Object.assign({})

    const plugins = [
        new webpack.DefinePlugin(Object.assign(definePluginConfig, {
            "process.env": {
                NODE_ENV: JSON.stringify(NODE_ENV)
            },
            __DEV__: DEV,
            log: DEV ? function () {
                    var _console;

                    return (_console = console).log.apply(_console, arguments);
                } : function () {
                    return false;
                },
        })),
        new webpack.IgnorePlugin(/vertx/),
    ]

    const babelOptions = {
        babelrc: false,
        presets: [["env", {"modules": false}], "react", "stage-0"],
        plugins: []
    }

    if (PROD) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            comments: false
        }))

        plugins.push(new webpack.LoaderOptionsPlugin({minimize: true}))

        babelOptions.presets.push('react-optimize')
    }


    plugins.push(new ExtractTextPlugin('../css/[name].css'))


    /**
     * Actual config object to return
     * */
    return {

        devtool: 'source-map',
        resolve: {
            extensions: ['.webpack.js', '.web.js', '.min.js', '.jsx', '.node',  '.js', '.json', '.jsx', '.es6', '.babel']
        },

        entry: {
            app:  path.join(__dirname, 'src', 'client', 'client.js'),
        },

        output: {
            path: path.join(__dirname,'public','js'),
            filename: '[name].bundle.js'
        },

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'babel-loader',
                        options: babelOptions
                    }]
                }, {
                    test: /\.(jpg|jpeg|png|gif|svg)$/i,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            name: 'images/[name].[ext]',
                            limit: 32 * 1024 // 32kb - data-url limit for IE
                        }
                    }]
                },
                {
                    test: /\.(css|scss)$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: true || {/* CSSNano Options */}
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: { sourceMap: true}
                            }
                        ]
                    })
                }

            ]
        },
        plugins
    }
}
