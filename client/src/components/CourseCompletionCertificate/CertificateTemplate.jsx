// src/components/CertificateTemplate/CertificateTemplate.jsx
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { WEBSITE_NAME_LOWER, WEBSITE_NAME } from '../../constants';
import FounderSignature from '../../assets/founder-signature.png';

const CertificateTemplate = ({ studentName, courseTitle, dateCompleted, certificateId }) => {
    const ORG_LOGO_SRC = "https://via.placeholder.com/100x40?text=FORD+LOGO";
    const FOUNDER_NAME = "Kyaw S. Hein";
    const FOUNDER_TITLE = "Founder & Visionary";
    const VERIFICATION_URL = `https://www.${WEBSITE_NAME_LOWER}.com/verify/${certificateId}`;

    const [qrCodeSize, setQrCodeSize] = useState(80);

    useEffect(() => {
        const handleResize = () => {
            let newSize = 50;
            if (window.innerWidth >= 768) {
                newSize = 80;
            }
            setQrCodeSize(newSize);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="bg-white border-4 border-[#D1F2EE] shadow-xl rounded-lg overflow-hidden w-full h-full flex flex-col font-sans">
            {/* Top Banner Section (Organization Name, Certificate Title, Logo) */}
            <div className="bg-[#2B4468] text-white p-2 md:p-4 flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex-grow text-left min-w-0">
                    <h2 className="text-sm md:text-md lg:text-lg font-bold leading-tight">{WEBSITE_NAME}</h2>
                    <p className="text-xs md:text-sm lg:text-md mt-1 leading-tight">Certificate of Completion</p>
                </div>
            </div>

            {/* Gradient Stroke Line - UPDATED */}
            <div className="w-full h-1 bg-gradient-to-r from-[#facc15] via-[#eab308] to-[#ca8a04]"></div>

            {/* Main Content Section - UPDATED */}
            <div className="flex-grow p-2 md:p-4 flex flex-col justify-center items-start text-left">
                <p className="text-[#374151] text-[10px] md:text-xs mb-1 md:mb-2">This certificate is proudly presented to</p>
                <h1 className="text-sm md:text-lg font-extrabold text-[#1d4ed8] mb-1 md:mb-2 leading-tight">
                    {studentName}
                </h1>
                <p className="text-[#374151] text-[10px] md:text-xs leading-relaxed">
                    for successfully completing the
                    <span className="font-semibold text-[#111827]"> {courseTitle} </span>
                    course on {dateCompleted}.
                </p>
            </div>

            {/* Bottom Section (Signatures and Verification) - UPDATED */}
            <div className="bg-[#fef9c3] p-2 md:p-4 flex flex-col flex-row justify-between gap-2">
                {/* Left: Founder Signature */}
                <div className="flex flex-col items-start text-left mt-auto">
                    <div className="w-20 md:w-22 h-auto border-b-1 border-[#C8C6C6] pb-1 px-4 mb-2 relative">
                        <img
                            src={FounderSignature}
                            alt="Founder Signature"
                            className="w-full h-full object-contain rotate-6"
                        />
                    </div>

                    <p className="text-[#1f2937] font-semibold text-sm md:text-md">{FOUNDER_NAME}</p>
                    <p className="text-[#4b5563] text-[12px] sm:text-sm">{FOUNDER_TITLE}</p>
                </div>

                {/* Right: QR Code and Verification Link */}
                <div className="flex flex-col items-end text-center sm:text-right text-[10px]">
                    {certificateId && (
                        <div className="mb-1 md:mb-2 p-1 bg-white rounded">
                            <QRCodeSVG
                                value={VERIFICATION_URL}
                                size={qrCodeSize}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    )}
                    Verify at
                    <a
                        href={VERIFICATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563eb] hover:underline text-[8px]"
                    >
                        {VERIFICATION_URL.replace(/^(https?:\/\/(www\.)?)/, '')}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CertificateTemplate;
