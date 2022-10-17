import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en-US">
        <Head />
        <body className="loading">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
