import createCache from '@emotion/cache';
import { documentGetInitialProps, DocumentHeadTags } from '@mui/material-nextjs/v15-pagesRouter';
import { Head, Html, Main, NextScript } from 'next/document';

export default function Document(props) {
  return (
    <Html lang="en">
      <Head>
        <DocumentHeadTags {...props} />
        <link rel="dns-prefetch" href="https://maps.googleapis.com/" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com/" />
        <link rel="dns-prefetch" href="https://mts0.googleapis.com/" />
        <link rel="dns-prefetch" href="https://mts1.googleapis.com/" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* <Script src="https://www.google.com/recaptcha/enterprise.js?render=6LdoiWgrAAAAANqVdHyLJqH9xqLkTj3M7--AIjHj" /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx) => {
  const finalProps = await documentGetInitialProps(ctx, {
    emotionCache: createCache({ enableCssLayer: true }),
  });
  return finalProps;
};
