'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import QRScanner from '../../../../components/attendance/QRScanner';
import LocationStatus from '../../../../components/attendance/LocationStatus';
import { useMarkAttendance, useStudentAttendanceHistory } from '../../../../hooks/useAttendance';
import {
  Camera,
  MapPin,
  QrCode,
  CheckCircle,
  XCircle,
  Video,
  Play,
  RotateCcw,
  Sparkles,
  Navigation,
  FileCheck
} from 'lucide-react';

export default function StudentMarkAttendancePage() {
  const markMutation = useMarkAttendance();
  const { data: history, refetch: refetchHistory } = useStudentAttendanceHistory();

  // Location states
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Camera capture states
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scanner states
  const [qrToken, setQrToken] = useState<string>('');
  const [scannedText, setScannedText] = useState<string>('');
  const [activeStep, setActiveStep] = useState<'scan' | 'face' | 'result'>('scan');
  
  // Result states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get GPS Coordinates on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const studentLat = position.coords.latitude;
          const studentLon = position.coords.longitude;
          setLat(studentLat);
          setLon(studentLon);

          // Calculate mockup classroom distance ( Bangalore center mock default )
          const CLASSROOM_LAT = 12.9716;
          const CLASSROOM_LON = 77.5946;
          
          // Haversine formula calculation mock
          const R = 6371e3; // Earth radius
          const dLat = ((CLASSROOM_LAT - studentLat) * Math.PI) / 180;
          const dLon = ((CLASSROOM_LON - studentLon) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((studentLat * Math.PI) / 180) *
              Math.cos((CLASSROOM_LAT * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const calculatedDist = R * c;

          setDistance(calculatedDist);
        },
        (err) => {
          console.error('Error fetching GPS coordinates:', err);
          // Fallback mocks
          setLat(12.9716);
          setLon(77.5946);
          setDistance(15.2); // within geofence
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Control Webcam Stream
  const startCamera = async () => {
    setIsCameraActive(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Webcam failed to start:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleQrScanSuccess = (text: string) => {
    setScannedText(text);
    setQrToken(text);
    // Move to Face biometric capture step
    setActiveStep('face');
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setActiveStep('face');
  };

  const handleFinalSubmit = () => {
    if (!qrToken || lat === null || lon === null) return;

    markMutation.mutate(
      {
        token: qrToken,
        lat,
        lon,
        faceImageBase64: capturedImage || undefined,
      },
      {
        onSuccess: (data) => {
          setSuccessMessage(data.message || 'Attendance verified successfully!');
          setErrorMessage(null);
          setActiveStep('result');
          refetchHistory();
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.error || 'Location geofencing check or face recognition rejected.');
          setSuccessMessage(null);
          setActiveStep('result');
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mark Attendance</h1>
          <p className="mt-1 text-gray-550 dark:text-gray-400">
            Scan your classroom projector QR code to verify your geolocated presence and face biometrics
          </p>
        </div>

        {/* Steps navigation */}
        <section className="flex items-center justify-center gap-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeStep === 'scan' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>1</span>
            <span className="text-xs font-bold">Scan QR Code</span>
          </div>
          <div className="h-px w-8 bg-gray-250 dark:bg-gray-800" />
          <div className="flex items-center space-x-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeStep === 'face' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>2</span>
            <span className="text-xs font-bold">Face Recognition</span>
          </div>
          <div className="h-px w-8 bg-gray-250 dark:bg-gray-800" />
          <div className="flex items-center space-x-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              activeStep === 'result' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>3</span>
            <span className="text-xs font-bold">Verified Status</span>
          </div>
        </section>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Card area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Scan QR Code */}
            {activeStep === 'scan' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  QR Code Scanner
                </h3>
                
                <QRScanner onScanSuccess={handleQrScanSuccess} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800" /></div>
                  <div className="relative flex justify-center text-xxs font-bold text-gray-400 uppercase tracking-widest"><span className="bg-white dark:bg-gray-900 px-3">or manual code fallback</span></div>
                </div>

                {/* Manual override fallback */}
                <form onSubmit={handleManualCodeSubmit} className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Enter QR token code manual fallback..."
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-750 focus:border-blue-500 rounded-xl focus:outline-none transition text-xs"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl text-xs shadow-sm transition">
                    Submit Code
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Face Biometrics Capture */}
            {activeStep === 'face' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6 text-center">
                <h3 className="text-base font-bold flex items-center text-left">
                  <Camera className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Face Biometric Scanner
                </h3>
                
                <div className="max-w-sm mx-auto aspect-square bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-250 dark:border-gray-850 flex items-center justify-center relative shadow-inner">
                  {capturedImage ? (
                    <img src={capturedImage} alt="Face profile" className="h-full w-full object-cover" />
                  ) : isCameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
                  ) : (
                    <div className="text-center p-6 text-gray-450 dark:text-gray-500">
                      <Video className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-800" />
                      <p className="text-xs font-semibold">Camera is disconnected</p>
                    </div>
                  )}

                  {/* Laser scan animation overlay */}
                  {isCameraActive && (
                    <div className="absolute left-0 right-0 h-1 bg-blue-500/80 shadow-[0_0_10px_2px_rgba(59,130,246,0.5)] animate-[bounce_3s_infinite]" />
                  )}
                </div>

                <div className="flex justify-center gap-3">
                  {!isCameraActive && !capturedImage && (
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center"
                    >
                      <Play className="h-4 w-4 mr-1.5 fill-white" /> Connect Camera
                    </button>
                  )}

                  {isCameraActive && (
                    <button
                      onClick={capturePhoto}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center"
                    >
                      <Camera className="h-4 w-4 mr-1.5" /> Capture Photo
                    </button>
                  )}

                  {capturedImage && (
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 border border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-bold transition flex items-center"
                    >
                      <RotateCcw className="h-4 w-4 mr-1.5" /> Retake Photo
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-850 max-w-sm mx-auto">
                  <button
                    onClick={() => { stopCamera(); setActiveStep('scan'); }}
                    className="text-xs font-bold text-gray-500 hover:underline"
                  >
                    Back to Scan
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={markMutation.isPending}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition disabled:opacity-75 flex items-center"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5 text-yellow-300 fill-yellow-300" />
                    {markMutation.isPending ? 'Verifying...' : 'Verify & Sign Attendance'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Result Screen */}
            {activeStep === 'result' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-8 shadow-sm text-center space-y-6">
                {successMessage ? (
                  <div className="space-y-4 py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-950/40 border-2 border-green-500">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-extrabold text-green-600 dark:text-green-400">Attendance Logged</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      {successMessage} Your geofenced presence and biometric face profile matching have been verified by the registrar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/40 border-2 border-red-500">
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400">Verification Failed</h2>
                    <p className="text-xs text-gray-550 dark:text-gray-400 max-w-sm mx-auto">
                      {errorMessage || 'We could not log your attendance. Check your geofence distance or make sure you are facing the camera.'}
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 dark:border-gray-850">
                  <button
                    onClick={() => setActiveStep('scan')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    Log New Attendance
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* GPS Info widget Column (ColSpan 1) */}
          <div className="space-y-6">
            <LocationStatus lat={lat} lon={lon} distance={distance} />

            {/* Quick stats history summary list */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold mb-4 flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Recent Records
              </h3>
              
              <div className="space-y-3">
                {history?.slice(0, 4).map((record) => {
                  const isPresent = record.status === 'present' || record.status === 'late';
                  return (
                    <div key={record.id} className="flex justify-between items-center text-xs border-b border-gray-50 dark:border-gray-850 pb-3 last:border-b-0 last:pb-0">
                      <div>
                        <h4 className="font-bold truncate max-w-[120px]">{record.courseTitle}</h4>
                        <p className="text-xxs text-gray-450 dark:text-gray-500 mt-0.5">
                          {new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-xxs uppercase ${
                        record.status === 'present' 
                          ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' 
                          : record.status === 'late'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
