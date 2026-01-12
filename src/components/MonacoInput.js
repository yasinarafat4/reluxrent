// components/MonacoInput.js
import Editor from '@monaco-editor/react';
import { Box, InputLabel, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useInput } from 'react-admin';

const schemaPresets = {
  'Service Schema': {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Clipping Path Service',
    serviceType: 'Photo Editing',
    provider: {
      '@type': 'Organization',
      name: 'Clipp Asia',
      url: 'https://clippasia.com',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://clippasia.com/service/clipping-path',
      priceCurrency: 'USD',
      price: '30.00',
      priceValidUntil: '2025-12-31',
    },
  },
  'LocalBusiness Schema': {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: "Joe's Pizza",
    image: 'https://example.com/pizza.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main St',
      addressLocality: 'New York',
      addressRegion: 'NY',
      postalCode: '10001',
      addressCountry: 'US',
    },
    telephone: '+1-800-555-1234',
    priceRange: '$$',
  },
  'Organization Schema': {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechCorp',
    url: 'https://www.techcorp.com',
    logo: 'https://www.techcorp.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-1234',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
  },
  'Product Schema': {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Wireless Headphones',
    image: 'https://example.com/headsphones.jpg',
    description: 'High-quality wireless headphones',
    brand: 'SoundMax',
    sku: '12345',
    offers: {
      '@type': 'Offer',
      url: 'https://example.com/wireless-headphones',
      priceCurrency: 'USD',
      price: '99.99',
      priceValidUntil: '2025-12-31',
    },
  },
  'Article Schema': {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Breaking News: Major Event Unfolds',
    image: 'https://example.com/article-image.jpg',
    datePublished: '2025-06-09T08:00:00+00:00',
    author: {
      '@type': 'Person',
      name: 'Jane Smith',
    },
    publisher: {
      '@type': 'Organization',
      name: 'News Corp',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.jpg',
      },
    },
  },
  'Event Schema': {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Music Concert',
    startDate: '2025-07-15T19:00:00',
    endDate: '2025-07-15T22:00:00',
    location: {
      '@type': 'Place',
      name: 'Madison Square Garden',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '4 Pennsylvania Plaza',
        addressLocality: 'New York',
        addressRegion: 'NY',
        postalCode: '10001',
        addressCountry: 'US',
      },
    },
    performer: {
      '@type': 'MusicGroup',
      name: 'The Rock Band',
    },
  },
};

const MonacoInput = ({ source, label, ...props }) => {
  const {
    field: { onChange, value },
  } = useInput({ source });
  const editorRef = useRef(null);
  const [editorValue, setEditorValue] = useState('{}');
  const [selectedSchema, setSelectedSchema] = useState('');
  const theme = useTheme();
  useEffect(() => {
    if (value) {
      setEditorValue(JSON.stringify(value, null, 2));
    }
  }, [value]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://example.com/schema.json', // arbitrary URI
          fileMatch: ['*'],
          schema: {
            type: 'object',
            properties: {
              '@context': { type: 'string' },
              '@type': { type: 'string' },
              headline: { type: 'string' },
              author: {
                type: 'object',
                properties: {
                  '@type': { type: 'string' },
                  name: { type: 'string' },
                },
              },
              datePublished: { type: 'string', format: 'date' },
              name: { type: 'string' },
              url: { type: 'string', format: 'uri' },
              logo: { type: 'string', format: 'uri' },
            },
            required: ['@context', '@type'],
          },
        },
      ],
    });
  };

  const handleEditorChange = (val) => {
    setEditorValue(val);
    try {
      const parsed = JSON.parse(val);
      onChange(parsed);
    } catch (err) {
      // validation handled in editor
    }
  };

  const handleSchemaSelect = (e) => {
    const selected = e.target.value;
    setSelectedSchema(selected);
    const schema = schemaPresets[selected];
    if (schema) {
      const formatted = JSON.stringify(schema, null, 2);
      setEditorValue(formatted);
      onChange(schema);
    }
  };
  const monacoTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light';
  return (
    <Box sx={{ mb: 2, width: '100%' }}>
      {label && <InputLabel>{label}</InputLabel>}
      <select className="mb-2 rounded border p-1" value={selectedSchema} onChange={handleSchemaSelect}>
        <option value="">-- Insert Sample Schema --</option>
        {Object.keys(schemaPresets).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      <Box
        sx={{
          height: 300,
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize,
          '& .monaco-editor': {
            borderRadius: 1,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.fontSize,
          },
        }}
      >
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="json"
          theme={monacoTheme}
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: theme.typography.fontSize,
            fontFamily: theme.typography.fontFamily,
            fixedOverflowWidgets: true,
          }}
        />
      </Box>
    </Box>
  );
};

export default React.memo(MonacoInput);
