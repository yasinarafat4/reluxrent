import { useReluxRentAppContext } from '@/contexts/ReluxRentAppContext';
import { Box, FormHelperText, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
const Editor = dynamic(() => import('@tinymce/tinymce-react').then((mod) => mod.Editor), { ssr: false });

const TinyMCEInputNormal = forwardRef(({ label, helperText, min_height = 400, value, onChange, error, isRequired = false, tinymceConfig }, ref) => {
  const { theme } = useReluxRentAppContext();
  const editorRef = useRef(null);

  // Force re-render on theme change
  const [editorKey, setEditorKey] = useState(theme);

  useEffect(() => {
    setEditorKey(theme);
  }, [theme]);

  // Handle editor change and pass it to onChange
  const handleEditorChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Box ref={ref} sx={{ width: '100%' }}>
      {label && (
        <Typography variant="body2" gutterBottom>
          {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}

      <Box
        sx={{
          border: error ? '1px solid red' : '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Editor
          licenseKey="gpl"
          key={editorKey} // Re-mounts editor on theme change
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          onInit={(evt, editor) => (editorRef.current = editor)}
          value={value} // Use the value directly from react-hook-form
          onEditorChange={handleEditorChange}
          init={{
            forced_root_block: false,
            skin: theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
            content_css: theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
            min_height,
            max_height: 800,
            width: '100%',
            menubar: false,
            plugins: 'advlist lists link image charmap anchor visualblocks code fullscreen media table wordcount accordion autoresize emoticons',
            toolbar:
              'undo redo | blocks | fontsizeinput fontfamily forecolor backcolor | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image media | accordion table | code removeformat fullscreen emoticons',
            images_upload_url: '/api/tinymce/image-upload',
            file_picker_types: 'image',
            file_picker_callback: (cb) => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.click();
              input.onchange = async () => {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('file', file);
                try {
                  const res = await fetch('/api/tinymce/image-upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await res.json();
                  if (data?.location) cb(data.location, { alt: file.name });
                  else alert('Image upload failed');
                } catch (err) {
                  console.error(err);
                  alert('Image upload failed');
                }
              };
            },
            branding: false,
            suffix: '.min',
            base_url: '/tinymce',
            ...tinymceConfig, // Allow overriding tinymce config from parent
          }}
        />
      </Box>

      {(error?.message || helperText) && <FormHelperText error={!!error}>{error?.message || helperText}</FormHelperText>}
    </Box>
  );
});

export default React.memo(TinyMCEInputNormal);
