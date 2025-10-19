// src/pages/CompletionCertificatePage/CompletionCertificatePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { WEBSITE_NAME_LOWER } from '../../constants'; // Assuming WEBSITE_NAME is defined here
import { getCertificateById } from '../../services/certificateService'; // Import your certificate service
import { getCurrentUser } from '../../services/userService'; 
import CertificateTemplate from './CertificateTemplate'; // Import the new CertificateTemplate component if it's a separate file
import CertificatePDFTemplate from './CertificatePDFTemplate';
import { getFileStreamUrl } from '../../services/fileService'; // NEW: Import getFileStreamUrl

function CompletionCertificate() {
    const { id } = useParams();
    const [certificateData, setCertificateData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const pdfCertificateRef = useRef(null);
    const [copyButtonText, setCopyButtonText] = useState('Copy link');
    const navigate = useNavigate();
    const [courseThumbnailUrl, setCourseThumbnailUrl] = useState(null); // NEW: State for the course thumbnail URL
    const location = useLocation();
    const fetchCertificateDetails = async () => {
        if (!id) return; // Ensure ID exists before fetching
        try {
            setLoading(true);
            const response = await getCertificateById(id);
            setCertificateData(response.data);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error("Error fetching certificate details:", err);
            setError(err);
            setCertificateData(null); // Clear data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificateDetails();
    }, [id]);
    // src/pages/CompletionCertificatePage/CompletionCertificatePage.jsx

// ... (existing code, including the `fetchCertificateDetails` function)

    // This useEffect handles initial load and ID changes
    useEffect(() => {
        fetchCertificateDetails();
    }, [id]); // Depend on 'id' to re-fetch when the certificate ID changes

    // NEW useEffect: Check URL for 'refresh' flag and re-fetch data, and update localStorage for user
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const shouldRefresh = queryParams.get('refresh') === 'true';

        const fetchAndStoreLatestUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn("No authentication token found. Cannot fetch latest user data for localStorage update.");
                    return;
                }

                const response = await getCurrentUser();
                const freshUser = response.data;
                localStorage.setItem('user', JSON.stringify(freshUser));
                console.log("localStorage 'user' updated from Certificate page refresh.");
            } catch (error) {
                console.error("Error fetching and storing latest user data from Certificate page:", error);
                if (error.response && error.response.status === 401) {
                    console.warn("User session expired or invalid token. Please log in again.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            }
        };

        if (shouldRefresh) {
            console.log("Refresh flag detected in URL. Re-fetching certificate data and updating user localStorage.");
            fetchCertificateDetails(); // Re-fetch certificate specific data
            fetchAndStoreLatestUserData(); // Fetch and update user data in localStorage
            // Optionally, you might want to remove the refresh flag from the URL
            // to prevent unnecessary re-fetches if the user navigates back to this URL.
            // navigate(location.pathname, { replace: true });
        }
    }, [location.search, id, navigate]);

    // useEffect to fetch the course thumbnail once certificateData is available
    useEffect(() => {
        const fetchThumbnail = async () => {
            if (certificateData?.courseInfo?.id) {
                try {
                    const url = await getFileStreamUrl(certificateData.courseInfo.id, 'image');
                    setCourseThumbnailUrl(url);
                } catch (err) {
                    console.error(`Failed to fetch thumbnail for course ID ${certificateData.courseInfo.id}:`, err);
                    setCourseThumbnailUrl(null); // Set to null on error or if no image is found
                }
            }
        };

        // Only attempt to fetch if certificateData is loaded and not currently loading
        if (!loading && certificateData) {
            fetchThumbnail();
        }
    }, [certificateData, loading]); // Depend on certificateData and loading state

    const handleDownloadPdf = () => {
        if (pdfCertificateRef.current) {
            // Define your desired fixed dimensions here
            const CERTIFICATE_WIDTH = 920;
            const CERTIFICATE_HEIGHT = 500;

            // Use setTimeout to ensure the DOM is fully rendered before capturing
            setTimeout(() => {
                html2canvas(pdfCertificateRef.current, {
                    scale: 2, // Keep scale for high quality
                    useCORS: true,
                    // Ensure the canvas itself matches the dimensions
                    width: CERTIFICATE_WIDTH,
                    height: CERTIFICATE_HEIGHT,
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');

                    // === THE KEY CHANGE IS HERE ===
                    // Create a PDF with custom dimensions [width, height] instead of 'a4'
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT]
                    });

                    // Add the image to fill the entire custom-sized PDF
                    pdf.addImage(imgData, 'PNG', 0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT, undefined, 'NONE');

                    const studentName = certificateData.userInfo?.username || 'Student';
                    const courseTitle = certificateData.courseInfo?.title || 'Course';
                    pdf.save(`${courseTitle}_Certificate_${studentName}.pdf`);

                }).catch(error => {
                    console.error("Error generating PDF:", error);
                    alert("Failed to generate PDF. Please try again or contact support.");
                });
            }, 0);
        } else {
            alert("Certificate data or element not found for PDF generation.");
        }
    };

    const handleCopyLink = () => {
        // Ensure you have the data needed to build the link
        if (!certificateData?.certificate?.id) {
            alert("Certificate ID not found, cannot create link.");
            return;
        }

        // Reconstruct the verification URL
        const verificationUrl = `https://www.${WEBSITE_NAME_LOWER}.com/verify/${certificateData.certificate.id}`;

        // Use the modern Clipboard API
        navigator.clipboard.writeText(verificationUrl).then(() => {
            // Success! Provide feedback to the user.
            setCopyButtonText('Copied!');

            // Reset the button text after a few seconds
            setTimeout(() => {
                setCopyButtonText('Copy link');
            }, 3000); // Reset after 3 seconds

        }).catch(err => {
            // Handle errors in case the copy fails
            console.error("Failed to copy link: ", err);
            alert("Failed to copy link. You may need to grant clipboard permissions.");
        });
    };

    const handleGoToCourse = () => {
        // Determine if it's a sub-course or a big course based on the number of hyphens in the ID
        const hyphenCount = (courseInfo.id.match(/-/g) || []).length; // Count occurrences of '-'

        if (hyphenCount === 3) { // Sub-course IDs have three hyphens (e.g., "sub-course-id-123")
            navigate(`/sub-course/${courseInfo.id}`); // Route for sub-course detail
        } else if (hyphenCount === 2) { // Big course IDs have two hyphens (e.g., "course-id-123")
            navigate(`/course-detail/${courseInfo.id}`); // Route for big course detail
        } else {
            // Fallback or error handling if ID format is unexpected
            console.warn(`Unexpected ID format for navigation: ${courseInfo.id}. Defaulting to course-detail.`);
            navigate(`/course-detail/${courseInfo.id}`);
        }
    };

    const formatDuration = (minutes) => {
        if (typeof minutes !== 'number' || minutes < 0) return '';
        if (minutes < 60) return `${minutes} Mins`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours} Hrs`;
        return `${hours} Hrs ${remainingMinutes} Mins`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center text-xl font-medium text-gray-700">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading certificate...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
                    <p className="mb-2">{error?.response?.data?.message}</p>
                </div>
            </div>
        );
    }

    if (!certificateData || !certificateData.certificate || !certificateData.courseInfo || !certificateData.userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-8 text-center text-xl font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="mb-2">Certificate not found or incomplete data.</p>
                    <p className="text-base">Please check the URL or try again later.</p>
                </div>
            </div>
        );
    }

    const { certificate, courseInfo, userInfo } = certificateData;

    const formattedDateReceived = new Date(certificate.completed_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const certificateProps = {
        studentName: userInfo.username,
        courseTitle: courseInfo.title,
        dateCompleted: formattedDateReceived,
        certificateId: certificate.id,
        orgName: WEBSITE_NAME_LOWER, // Pass WEBSITE_NAME to the PDF template
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div style={{ position: 'absolute', left: '-9999px', width: '920px', height: '500px' }}>
                <div ref={pdfCertificateRef} style={{ width: '920px', height: '500px' }}>
                    <CertificatePDFTemplate {...certificateProps} />
                </div>
            </div>
            <header className="bg-white shadow-sm pb-4 pt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 text-center">
                        Completion Certificate
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                <section className="mb-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl text-center md:text-start font-bold text-gray-900 mb-4">
                        {courseInfo.title}
                    </h2>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    <div className="lg:col-span-3 space-y-6 lg:order-last">
                        <section className="bg-[#F0FAF9] rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center justify-center h-[320px] md:h-[400px] overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center bg-[#F0FAF9]">
                                <CertificateTemplate {...certificateProps} />
                            </div>
                        </section>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleDownloadPdf}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-300"
                            >
                                Download
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-300"
                            >
                                {copyButtonText}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6 lg:order-first">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative">
                                {/* UPDATED: Use courseThumbnailUrl for the image source */}
                                <img
                                    src={courseThumbnailUrl}
                                    alt={courseInfo.title}
                                    className="w-full h-48 sm:h-64 object-cover"
                                />

                                {/* === NEW DURATION BOX === */}
                                {/* We check if courseInfo.duration exists before rendering the box */}
                                {courseInfo.duration > 0 && (
                                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg">
                                        {formatDuration(courseInfo.duration)}
                                    </div>
                                )}

                                {/* Existing overlay for the button */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-end p-4">
                                    <button
                                        onClick={handleGoToCourse} // Assuming you have this function
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-md md:text-lg font-semibold transition duration-300">
                                        Go to course
                                    </button>
                                </div>
                            </div>
                        </div>

                        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
                            <div className="flex border-b border-gray-200 mb-4">
                                <button
                                    className={`py-2 px-4 text-sm sm:text-base font-medium ${activeTab === 'overview'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Course overview
                                </button>
                                <button
                                    className={`py-2 px-4 text-sm sm:text-base font-medium ${activeTab === 'learn'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    onClick={() => setActiveTab('learn')}
                                >
                                    What you will learn
                                </button>
                            </div>
                            <div>
                                {activeTab === 'overview' && (
                                    <p className="text-gray-700 text-sm leading-snug sm:leading-relaxed whitespace-pre-line">
                                        {courseInfo.overview}
                                    </p>
                                )}

                                {activeTab === 'learn' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {(courseInfo.what_you_will_learn).map((item, index) => (
                                            <div key={index} className="flex items-start text-gray-700 text-sm">
                                                <span className="text-green-500 mr-2 mt-1">&#10003;</span>
                                                <p>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                Skills you will gain
                            </h2>
                            <div className="flex flex-wrap gap-2.5 sm:gap-3">
                                {courseInfo.skills?.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm hover:bg-blue-200 transition-colors"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CompletionCertificate;
