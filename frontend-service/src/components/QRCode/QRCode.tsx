import { toString as QRCodeToString } from 'qrcode';
import { useEffect, useState } from 'react';

import { Logger } from '../../utils/logger';

const log = new Logger('Barcode');

interface QRCodeProps {
  data?: string | null;
  altText?: string;
}

/**
 * TODO: Add support for text label
 */
export function QRCode({ data }: QRCodeProps) {
  const [svgXml, setSvgXml] = useState('');
  useEffect(() => {
    if (data) {
      QRCodeToString(data, { type: 'svg', color: { light: '#ffffff00' } })
        .then((svgText) => {
          setSvgXml(svgText);
        })
        .catch((error) => {
          log.error(error);
        });
    }
  }, [data]);
  if (!svgXml) {
    return null;
  }

  return (
    // <View style={{ height: '100%' }}>
    // <svg width="100%" height="100%">
    // 	{svgXml}
    // </svg>
    <div
      style={{
        maxWidth: 200,
      }}
      dangerouslySetInnerHTML={{ __html: `<svg width="100%" height="100%">${svgXml}</svg>` }}
    />
    // </View>
  );
}
