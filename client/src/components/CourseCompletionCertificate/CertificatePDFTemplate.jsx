// src/components/CertificateTemplate/CertificatePDFTemplate.jsx
import { QRCodeSVG } from 'qrcode.react';
import { WEBSITE_NAME } from '../../constants';
import FounderSignature from '../../assets/founder-signature.png';
// This is a NON-RESPONSIVE template designed for a fixed-size PDF.
const CertificatePDFTemplate = ({ studentName, courseTitle, dateCompleted, certificateId, orgName }) => {
    const FOUNDER_NAME = "Kyaw S. Hein";
    const FOUNDER_TITLE = "Founder & Visionary";
    const VERIFICATION_URL = `https://www.${orgName}.com/verify/${certificateId}`;

    return (
        // All units are fixed. No responsive prefixes.
        <div className="bg-white border-4 border-[#D1F2EE] shadow-xl rounded-lg overflow-hidden w-full h-full flex flex-col font-sans">
            {/* Top Banner Section */}
            <div className="bg-[#2B4468] text-white p-6 flex justify-between items-center">
                <div className="text-left">
                    <h2 className="text-2xl font-bold leading-tight">{WEBSITE_NAME}</h2>
                    <p className="text-lg mt-1 leading-tight">Certificate of Completion</p>
                </div>
            </div>

            {/* Gradient Stroke Line - USE THE CUSTOM CSS CLASS HERE */}
            <div className="gradient-line"></div> {/* <-- CHANGED THIS LINE */}

            {/* Main Content Section */}
            <div className="flex-grow p-8 flex flex-col justify-center items-start text-left">
                <p className="text-[#374151] text-lg mb-4">This certificate is proudly presented to</p>
                <h1 className="text-4xl font-extrabold text-[#1d4ed8] mb-4 leading-tight">
                    {studentName}
                </h1>
                <p className="text-[#374151] text-lg leading-relaxed">
                    for successfully completing the
                    <span className="font-semibold text-[#111827]"> {courseTitle} </span>
                    course on {dateCompleted}.
                </p>
            </div>

            {/* Bottom Section */}
            <div className="bg-[#fef9c3] p-6 flex justify-between items-end gap-4">
                {/* Left: Founder Signature */}
                <div className="flex flex-col items-start text-left mb-6">
                    <div
                        className="w-20 md:w-22 h-auto px-4 relative"
                        style={{
                            borderBottomWidth: '1px',
                            borderBottomColor: '#C8C6C6',
                            paddingBottom: '0.25rem',
                        }}
                    >
                        <img
                            src={FounderSignature}
                            alt="Founder Signature"
                            style={{ transform: 'rotate(9deg)' }}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <p className="text-[#1f2937] font-semibold text-lg">{FOUNDER_NAME}</p>
                    <p className="text-[#4b5563] text-base">{FOUNDER_TITLE}</p>
                </div>

                {/* Right: QR Code and Verification Link */}
                <div className="flex flex-col items-end text-right text-sm">
                    {certificateId && (
                        <div className="mb-2 p-1 bg-white rounded">
                            <QRCodeSVG
                                value={VERIFICATION_URL}
                                size={100} // Fixed size for the QR code
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    )}
                    <span className="text-xs">Verify at</span>
                    <a
                        href={VERIFICATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563eb] hover:underline text-xs break-all"
                    >
                        {VERIFICATION_URL.replace(/^(https?:\/\/(www\.)?)/, '')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CertificatePDFTemplate;
