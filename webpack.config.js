const path = require("path");
const { VueLoaderPlugin } = require('vue-loader')
const { VuetifyPlugin } = require('webpack-plugin-vuetify')

module.exports = {
    entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  mode: "development",
  performance: {
    hints: false,
  },
  plugins: [
    new VueLoaderPlugin(),
    new VuetifyPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      // Другие правила для обработки стилей, изображений и других ресурсов
    ],
  },

    devServer: {
    port: 8080,
    onAfterSetupMiddleware(devServer) {
      devServer.app.post("*", (req, res) => {
        res.redirect(req.originalUrl);
      });
    },
    static: {
      directory: "./dist",
    },
    proxy: {
      // Настройка прокси, если нужно
    },
  },
}
