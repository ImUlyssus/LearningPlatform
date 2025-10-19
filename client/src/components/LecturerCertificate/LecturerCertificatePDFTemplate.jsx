// src/components/CertificateTemplate/LecturerCertificatePDFTemplate.jsx
import { QRCodeSVG } from 'qrcode.react';
import { WEBSITE_NAME } from '../../constants';
import FounderSignature from '../../assets/founder-signature.png';
const LecturerCertificatePDFTemplate = ({ lecturerName, subCourseTitle, dateOfAppreciation, mapId, orgName }) => {
    const FOUNDER_NAME = "Kyaw S. Hein";
    const FOUNDER_TITLE = "Founder & Visionary";
    // Adjust the verification URL path for lecturer certificates
    const VERIFICATION_URL = `https://www.${orgName}.com/lecturer-certificate/${mapId}`; // Assuming this is the verification path

    return (
        // All units are fixed. No responsive prefixes.
        <div className="bg-white border-4 border-[#D1F2EE] shadow-xl rounded-lg overflow-hidden w-full h-full flex flex-col font-sans">
            {/* Top Banner Section */}
            <div className="bg-[#2B4468] text-white p-6 flex justify-between items-center">
                <div className="text-left mb-auto">
                    <h2 className="text-2xl font-bold leading-tight">{WEBSITE_NAME}</h2>
                    <p className="text-lg mt-1 leading-tight">Certificate of Appreciation</p>
                </div>
            </div>

            {/* Gradient Stroke Line */}
            {/* <div className="w-full h-2 bg-[#eab308]"></div> */}
            <div className="gradient-line"></div> 

            {/* Main Content Section */}
            <div className="flex-grow p-8 flex flex-col justify-center items-start text-left">
                <p className="text-[#374151] text-lg mb-4">This Certificate of Appreciation is proudly presented to</p>
                <h1 className="text-4xl font-extrabold text-[#1d4ed8] mb-4 leading-tight">
                    {lecturerName}
                </h1>
                <p className="text-[#374151] text-lg leading-relaxed">
                    for their outstanding contribution as a lecturer for the
                    <span className="font-semibold text-[#111827]"> {subCourseTitle} </span>
                    course, recognized on {dateOfAppreciation}.
                </p>
            </div>

            {/* Bottom Section - Adjusted padding and margins */}
            <div className="bg-[#fef9c3] p-4 flex justify-between items-end gap-2"> {/* Reduced p-6 to p-4, reduced gap-4 to gap-2 */}
                {/* Left: Founder Signature */}
                <div className="flex flex-col items-start text-left"> {/* Removed mb-6 */}
                    <div
                        className="w-20 md:w-22 h-auto px-4 relative" // Removed border-b-1, border-[#C8C6C6], pb-1
                        style={{
                            borderBottomWidth: '1px',
                            borderBottomColor: '#C8C6C6',
                            paddingBottom: '0.25rem', // Equivalent to Tailwind's pb-1 (4px)
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
                    {mapId && (
                        <div className="mb-0 p-1 bg-white rounded"> {/* Reduced mb-2 to mb-0 */}
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

export default LecturerCertificatePDFTemplate;
