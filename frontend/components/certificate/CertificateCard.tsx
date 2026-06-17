'use client';

import React, { useState } from 'react';
import { Award, Download, Share2, ShieldCheck, Linkedin, Twitter, Mail, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

interface Certificate {
  id: string;
  courseId: string;
  courseTitle?: string;
  course?: { title: string };
  serialNumber: string;
  issueDate: string;
  pdfUrl: string;
  blockchainHash: string | null;
  qrCode: string;
  score: number | null;
}

interface CertificateCardProps {
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [sharing, setSharing] = useState(false);
  const [shareLinks, setShareLinks] = useState<{ linkedin: string; twitter: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const courseTitle = certificate.courseTitle || certificate.course?.title || 'Course Curriculum';

  // Handle Share links fetch
  const handleShareClick = async () => {
    if (shareLinks) {
      setSharing(!sharing);
      return;
    }

    try {
      const res = await api.post(`/student/certificates/${certificate.id}/share`);
      setShareLinks(res.data);
      setSharing(true);
    } catch (err) {
      console.error('Failed to load sharing links', err);
    }
  };

  // Copy Verification link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle certificate print preview download
  const handleDownload = () => {
    // Open print view of certificate
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = new Date(certificate.issueDate).toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const html = `
      <html>
        <head>
          <title>Certificate - ${courseTitle}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #f4f6f9;
              font-family: 'Montserrat', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .cert-frame {
              width: 800px;
              height: 560px;
              padding: 40px;
              border: 16px double #1e3a8a;
              background: #ffffff;
              box-shadow: 0 20px 50px rgba(0,0,0,0.15);
              box-sizing: border-box;
              position: relative;
              text-align: center;
              background-image: radial-gradient(circle, #fcfdff 80%, #f4f7fe 100%);
            }
            .cert-header {
              font-family: 'Cinzel', serif;
              font-weight: 800;
              font-size: 28px;
              color: #1e3a8a;
              letter-spacing: 4px;
              margin-top: 10px;
              text-transform: uppercase;
            }
            .cert-sub {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 2px;
              margin-top: 20px;
            }
            .cert-title {
              font-size: 14px;
              color: #475569;
              margin-top: 30px;
            }
            .cert-name {
              font-family: 'Cinzel', serif;
              font-size: 36px;
              color: #0f172a;
              font-weight: 600;
              border-bottom: 2px solid #cbd5e1;
              width: max-content;
              margin: 10px auto 0 auto;
              padding-bottom: 5px;
            }
            .cert-description {
              font-size: 13px;
              color: #334155;
              line-height: 1.8;
              max-width: 550px;
              margin: 25px auto 0 auto;
            }
            .cert-course {
              font-weight: 700;
              color: #1d4ed8;
            }
            .cert-date {
              margin-top: 35px;
              font-size: 12px;
              font-weight: 600;
              color: #475569;
            }
            .cert-footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              padding: 0 40px;
            }
            .signature {
              width: 140px;
              border-top: 1px solid #94a3b8;
              padding-top: 8px;
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
            }
            .blockchain-stamp {
              text-align: left;
              max-width: 280px;
            }
            .blockchain-stamp p {
              margin: 0;
              font-size: 8px;
              font-family: monospace;
              color: #64748b;
              word-break: break-all;
              line-height: 1.4;
            }
            .badge-gold {
              position: absolute;
              top: 30px;
              right: 40px;
              width: 60px;
              height: 60px;
              background: #fbbf24;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 6px 12px rgba(251, 191, 36, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="cert-frame">
            <div class="badge-gold">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div class="cert-sub">Certificate of Completion</div>
            <div class="cert-header">EduSphere Academy</div>
            <div class="cert-title">This is proudly presented to</div>
            <div class="cert-name">Honorary Scholar</div>
            <div class="cert-description">
              for successfully completing all academic requirements, assessments, and verifiable grading benchmarks set forth for the curriculum of <span class="cert-course">${courseTitle}</span>.
            </div>
            
            <div class="cert-date">Granted on ${formattedDate}</div>

            <div class="cert-footer">
              <div class="blockchain-stamp">
                <p><strong>REGISTRY ID:</strong> ${certificate.serialNumber}</p>
                <p><strong>BLOCKCHAIN PROOF:</strong> ${certificate.blockchainHash || 'N/A'}</p>
              </div>
              <div class="signature">
                EduSphere Registrar
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden transition hover:shadow-md">
      
      {/* Decorative Gold Seal Badge */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 mb-4 ring-4 ring-amber-100 dark:ring-amber-950/40">
        <Award className="h-10 w-10 animate-pulse" />
      </div>

      {/* Course Title and Serial */}
      <h3 className="text-base font-extrabold text-gray-900 dark:text-white text-center leading-snug max-w-xs">
        {courseTitle}
      </h3>
      
      <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1.5 font-mono">
        ID: {certificate.serialNumber}
      </p>

      {/* Blockchain indicator */}
      {certificate.blockchainHash && (
        <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/30 rounded-full text-xxs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Blockchain Anchored</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-3 mt-6 border-t border-gray-100 dark:border-gray-850 pt-5">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-350 rounded-xl font-bold transition text-xs"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Print PDF
        </button>

        <button
          onClick={handleShareClick}
          className="flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-xs shadow-sm shadow-blue-500/10"
        >
          <Share2 className="h-4 w-4 mr-1.5" />
          Share Badge
        </button>
      </div>

      {/* Share Links Panel */}
      {sharing && shareLinks && (
        <div className="w-full mt-4 p-4 border border-gray-100 dark:border-gray-800 bg-gray-55/40 dark:bg-gray-850 rounded-xl flex flex-col gap-3.5 animate-fadeIn">
          <p className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Social Channels</p>
          <div className="flex gap-2.5 justify-center">
            
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-[#0a66c2] rounded-xl transition hover:scale-110"
              title="Share on LinkedIn"
            >
              <Linkedin className="h-5 w-5 fill-current" />
            </a>

            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 text-[#1da1f2] rounded-xl transition hover:scale-110"
              title="Post on Twitter"
            >
              <Twitter className="h-5 w-5 fill-current" />
            </a>

            <a
              href={shareLinks.email}
              className="p-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-650 rounded-xl transition hover:scale-110"
              title="Email Certificate link"
            >
              <Mail className="h-5 w-5" />
            </a>

          </div>

          <button
            onClick={handleCopyLink}
            className="w-full text-center py-1.5 border border-dashed border-gray-250 dark:border-gray-700 rounded-lg text-xxs font-bold text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 transition flex items-center justify-center gap-1"
          >
            {copied ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Verification Link Copied!</span>
              </>
            ) : (
              <span>Copy Verification Link</span>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
