import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    } else if (!isOpen && isScanning) {
      stopScanning();
    }

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [isOpen, isScanning]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError('');
      setIsScanning(true);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      if (!window.isSecureContext) {
        throw new Error('InsecureContext');
      }

      const videoInputDevices = await codeReader.listVideoInputDevices();
      if (!videoInputDevices || videoInputDevices.length === 0) {
        throw new Error('NoDevicesFound');
      }

      // Try to find back camera first (for mobile)
      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      );
      const selectedDevice = backCamera || videoInputDevices[0];

      await codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            console.log('Scanned barcode:', barcodeText);
            onScan(barcodeText);
            stopScanning();
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanner error:', error);
          }
        }
      );
    } catch (err: any) {
      console.error('Scanner error:', err);

      if (err.message === 'InsecureContext') {
        setError('Camera access requires a secure connection (HTTPS).');
      } else if (err.message === 'NoDevicesFound' || err.name === 'NotFoundError') {
        setError('No camera found on this device. Please ensure a camera is connected.');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application.');
      } else {
        setError('Failed to access camera. Please check permissions and connection.');
      }

      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan Barcode
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={startScanning}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
              {import.meta.env.DEV && (
                <button
                  onClick={() => {
                    const mockBarcodes = ['3017620422003', '7613035303493', '5449000000996'];
                    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
                    console.log('Simulating scan of barcode:', randomBarcode);
                    onScan(randomBarcode);
                    onClose();
                  }}
                  className="text-emerald-600 border border-emerald-600 px-4 py-2 rounded-md hover:bg-emerald-50 transition-colors"
                >
                  Simulate Scan (Dev Mode)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-md object-cover"
              playsInline
              muted
            />
            <p className="text-sm text-gray-600 text-center">
              Position the barcode within the camera view
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
