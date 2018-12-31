const path = require('path');

module.exports = {
  devtool: 'eval-source-map',
  entry: "./js/game.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "app", "static")
  },
  mode: "production",
  "module": {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'entry',
                modules: false,
                targets: [
                  'last 2 firefox versions',
                  'last 2 chrome versions',
                  'last 2 edge versions',
                  'last 2 ios versions',
                ],
                exclude: ["transform-regenerator"]
              }]
            ]
          }
        }
      }
    ]
  }
}
