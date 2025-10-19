// src/pages/LecturerAppreciationCertificatePage/LecturerAppreciationCertificatePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { WEBSITE_NAME } from '../../constants';
import { getLecturerMapById } from '../../services/lecturerMapService'; // Your service to get lecturer map data
import { getFileStreamUrl } from '../../services/fileService'; // For fetching thumbnail
import LecturerCertificateTemplate from './LecturerCertificateTemplate'; // NEW: Create this component
import LecturerCertificatePDFTemplate from './LecturerCertificatePDFTemplate'; // NEW: Create this component

function LecturerCertificate() {
    const { id } = useParams(); // This 'id' will now be the Lecturers_Map ID
    const [lecturerMapData, setLecturerMapData] = useState(null); // Renamed state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const pdfCertificateRef = useRef(null);
    const [copyButtonText, setCopyButtonText] = useState('Copy link'); // This might be removed/changed
    const navigate = useNavigate();
    const [subCourseThumbnailUrl, setSubCourseThumbnailUrl] = useState(null); // Renamed state for sub-course thumbnail

    useEffect(() => {
        const fetchLecturerMapDetails = async () => {
            try {
                setLoading(true);
                // getLecturerMapById now returns { mapping, lecturer, subCourse }
                const response = await getLecturerMapById(id);
                setLecturerMapData(response.data); // Store the combined data
            } catch (err) {
                console.error("Error fetching lecturer map details:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLecturerMapDetails();
        }
    }, [id]);

    useEffect(() => {
        const fetchThumbnail = async () => {
            // Check if subCourse data exists and has a thumbnail URL
            if (lecturerMapData?.subCourse?.thumbnail) {
                try {
                    // Assuming getFileStreamUrl can handle direct URLs or IDs
                    // If subCourse.thumbnail is already a full URL, you might not need getFileStreamUrl
                    // If it's just an ID or path, then use getFileStreamUrl
                    const url = await getFileStreamUrl(lecturerMapData.subCourse.id, 'image');
                    setSubCourseThumbnailUrl(url);
                } catch (err) {
                    console.error(`Failed to fetch thumbnail for sub-course ID ${lecturerMapData.subCourse.id}:`, err);
                    setSubCourseThumbnailUrl(null);
                }
            } else {
                setSubCourseThumbnailUrl(null); // Clear if no thumbnail
            }
        };

        if (!loading && lecturerMapData) {
            fetchThumbnail();
        }
    }, [lecturerMapData, loading]);

    const handleDownloadPdf = () => {
        if (pdfCertificateRef.current) {
            const CERTIFICATE_WIDTH = 920;
            const CERTIFICATE_HEIGHT = 520;

            setTimeout(() => {
                html2canvas(pdfCertificateRef.current, {
                    scale: 2,
                    useCORS: true,
                    width: CERTIFICATE_WIDTH,
                    height: CERTIFICATE_HEIGHT,
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                        orientation: 'landscape',
                        unit: 'px',
                        format: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT]
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT, undefined, 'NONE');

                    const lecturerName = lecturerMapData.lecturer?.username || 'Lecturer';
                    const subCourseTitle = lecturerMapData.subCourse?.title || 'Sub-Course';
                    pdf.save(`${lecturerName}_Appreciation_for_${subCourseTitle}.pdf`);

                }).catch(error => {
                    console.error("Error generating PDF:", error);
                    alert("Failed to generate PDF. Please try again or contact support.");
                });
            }, 0);
        } else {
            alert("Certificate data or element not found for PDF generation.");
        }
    };

    // This function for copying verification link is likely NOT relevant for lecturer certificates.
    // Consider removing it or repurposing it if there's a new "verification" concept for lecturers.
    const handleCopyLink = () => {
        // If you still need a shareable link, decide what it should link to.
        // For now, I'll keep the logic but it's probably not ideal.
        if (!lecturerMapData?.id) { // Using the lecturer map ID
            alert("Lecturer map ID not found, cannot create link.");
            return;
        }

        // Example: A link to this very certificate page
        const appreciationUrl = `https://www.${WEBSITE_NAME}.com/lecturer-certificate/${lecturerMapData.id}`; // Adjust path as needed

        navigator.clipboard.writeText(appreciationUrl).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => {
                setCopyButtonText('Copy link');
            }, 3000);
        }).catch(err => {
            console.error("Failed to copy link: ", err);
            alert("Failed to copy link. You may need to grant clipboard permissions.");
        });
    };

    const handleGoToCourse = () => {
        // This button should navigate to the sub-course taught by the lecturer
        if (lecturerMapData?.subCourse?.id) {
            navigate(`/sub-course/${lecturerMapData.subCourse.id}`);
        } else {
            console.warn("Sub-course ID not found for navigation.");
            // Optionally navigate to a general courses page or show an error
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
                    Loading lecturer appreciation certificate...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
                    <p className="mb-2">{error?.response?.data?.message || "An error occurred."}</p>
                </div>
            </div>
        );
    }

    // Check if the necessary data is available
    if (!lecturerMapData || !lecturerMapData.lecturer || !lecturerMapData.subCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="p-8 text-center text-xl font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="mb-2">Lecturer appreciation certificate not found or incomplete data.</p>
                    <p className="text-base">Please check the URL or try again later.</p>
                </div>
            </div>
        );
    }

    // Destructure the data for easier access
    const { lecturer, subCourse, createdAt } = lecturerMapData; // createdAt is from Lecturers_Map

    // Format the date for the certificate (using the mapping's creation date as "Date of Appreciation")
    const formattedDateOfAppreciation = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Prepare props for the certificate templates
    const certificateProps = {
        lecturerName: lecturer.username,
        subCourseTitle: subCourse.title,
        dateOfAppreciation: formattedDateOfAppreciation,
        mapId: lecturerMapData.id, // Using the mapping ID as a unique identifier for this certificate
        orgName: WEBSITE_NAME,
        lecturerProfileUrl: lecturer.profile_url, // Pass lecturer's profile URL if available
        subCourseOverview: subCourse.overview,
        subCourseSkills: subCourse.skills,
        subCourseWhatYouWillLearn: subCourse.what_you_will_learn,
        subCourseDuration: subCourse.duration,
        subCourseCost: subCourse.cost,
        subCourseThumbnail: subCourseThumbnailUrl // Pass the fetched thumbnail URL
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hidden div for PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', width: '920px', height: '520px' }}>
                <div ref={pdfCertificateRef} style={{ width: '920px', height: '520px' }}>
                    {/* Use the new PDF template */}
                    <LecturerCertificatePDFTemplate {...certificateProps} />
                </div>
            </div>

            <header className="bg-white shadow-sm pb-4 pt-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-xl md:text-4xl font-extrabold tracking-tight text-gray-900 text-center">
                        Lecturer Appreciation Certificate
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                <section className="mb-8">
                    <h2 className="text-lg md:text-3xl text-center md:text-start font-bold text-gray-900 mb-4">
                        {subCourse.title}
                    </h2>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    <div className="lg:col-span-3 space-y-6 lg:order-last">
                        <section className="bg-[#F0FAF9] rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center justify-center h-[320px] md:h-[400px] overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center bg-[#F0FAF9]">
                                {/* Use the new template for display */}
                                <LecturerCertificateTemplate {...certificateProps} />
                            </div>
                        </section>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleDownloadPdf}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-300"
                            >
                                Download Certificate
                            </button>
                            {/* Decide if you still need a "Copy link" button here */}
                            <button
                                onClick={handleCopyLink}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-6 py-2 rounded-lg text-base font-semibold shadow-md transition duration-300"
                            >
                                {copyButtonText}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6 lg:order-first">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative">
                                {/* Use subCourseThumbnailUrl for the image source */}
                                <img
                                    src={subCourseThumbnailUrl || 'placeholder-image-url.jpg'} // Provide a fallback
                                    alt={subCourse.title}
                                    className="w-full h-48 sm:h-64 object-cover"
                                />

                                {subCourse.duration > 0 && (
                                    <div className="absolute top-4 right-4 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg">
                                        {formatDuration(subCourse.duration)}
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-end p-4">
                                    <button
                                        onClick={handleGoToCourse}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-md md:text-lg font-semibold transition duration-300">
                                        Go to Course
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
                                    Course Overview
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
                                    <p className="text-gray-700 text-sm sm:text-base leading-snug sm:leading-relaxed whitespace-pre-line">
                                        {subCourse.overview}
                                    </p>
                                )}
                                {activeTab === 'learn' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {(subCourse.what_you_will_learn || []).map((item, index) => (
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
                                {subCourse.skills?.map((skill, index) => (
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

export default LecturerCertificate;
