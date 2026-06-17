'use client';

import React, { useEffect, useState } from 'react';
import { Camera, AlertTriangle, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompting'>('prompting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let scanner: any = null;

    // Check camera permission
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(() => {
        setCameraPermission('granted');

        // Dynamically load html5-qrcode to prevent Next.js SSR window errors
        import('html5-qrcode').then((Html5QrcodeModule) => {
          scanner = new Html5QrcodeModule.Html5QrcodeScanner(
            'qr-reader-container',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText: string) => {
              onScanSuccess(decodedText);
              // Stop scanning on success
              scanner.clear().catch(() => {});
            },
            (error: any) => {
              // Ignore standard scan matching failures
            }
          );
        }).catch((err) => {
          setErrorMessage('Failed to load QR scanner module.');
        });
      })
      .catch((err) => {
        console.error('Camera access error:', err);
        setCameraPermission('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in browser settings.');
      });

    return () => {
      if (scanner) {
        scanner.clear().catch((e: any) => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800">
      
      {cameraPermission === 'prompting' && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 mx-auto mb-3 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-650 dark:text-gray-400">Requesting Camera access...</p>
        </div>
      )}

      {cameraPermission === 'denied' && (
        <div className="text-center py-6 px-4">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-500" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Camera Access Denied</h4>
          <p className="text-xs text-gray-500 dark:text-gray-405 mt-1 max-w-xs mx-auto">
            {errorMessage}
          </p>
        </div>
      )}

      {cameraPermission === 'granted' && (
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="flex items-center space-x-2 text-xs font-semibold text-green-600 dark:text-green-400 mb-4 bg-green-50 dark:bg-green-950/40 px-3 py-1 rounded-full">
            <Camera className="h-4 w-4" />
            <span>Camera Connected (Rear-Facing)</span>
          </div>

          {/* Scanner view element */}
          <div 
            id="qr-reader-container" 
            className="w-full aspect-square bg-black rounded-2xl overflow-hidden shadow-inner border-2 border-dashed border-gray-300 dark:border-gray-700" 
          />

          <p className="text-xxs text-gray-450 dark:text-gray-500 mt-4 text-center">
            Position the attendance QR code inside the green scanner bounding box
          </p>
        </div>
      )}
      
    </div>
  );
}
