import React from 'react';
import { WEBSITE_NAME, TERMS_EMAIL } from "../../constants"; // Ensure this path is correct

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Terms of Service
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to {WEBSITE_NAME}! These Terms of Service ("Terms") govern your access to and use of our e-learning platform, including any content, functionality, and services offered on or through {WEBSITE_NAME}.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            By accessing or using {WEBSITE_NAME}, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Account Registration and Eligibility</h2>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li className="mb-1">
              You must be at least 13 years old to create an account and use {WEBSITE_NAME}.
            </li>
            <li className="mb-1">
              You are responsible for maintaining the confidentiality of your account login information and for all activities that occur under your account.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Acceptable Use and Prohibited Conduct</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            You agree to use {WEBSITE_NAME} only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li className="mb-1">
              Distribute any course materials or content obtained from {WEBSITE_NAME} outside of the platform. All course content is for your personal, non-commercial use only.
            </li>
            <li className="mb-1">
              Engage in any form of cheating, plagiarism, or academic dishonesty related to courses, quizzes, or certificates on the platform.
            </li>
            <li className="mb-1">
              Use {WEBSITE_NAME} for any illegal activities or in violation of any applicable local, national, or international law or regulation.
            </li>
            <li className="mb-1">
              Attempt to interfere with, disrupt, or compromise the integrity or security of the platform or its related systems.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Intellectual Property Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            All content on {WEBSITE_NAME}, including but not limited to courses, videos, text, graphics, logos, images, software, and the compilation thereof, is the property of {WEBSITE_NAME} or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to access and view the content for your personal, non-commercial learning purposes only.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Users cannot generate or upload their own content to the platform. Your interaction is limited to learning, taking quizzes, and earning certificates provided by {WEBSITE_NAME}.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Payments and Refunds</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            {WEBSITE_NAME} offers courses and memberships for purchase. By making a purchase, you agree to the specified pricing and payment terms.
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li className="mb-1">
              <strong>Per Course Subscription:</strong> For individual course purchases, you may request a full refund within 12 hours of the payment date. Refund requests made after this 12-hour period will not be granted.
            </li>
            <li className="mb-1">
              <strong>One-Year Membership:</strong> For one-year memberships, you may request a refund within 5 days of the payment date. However, if you have accessed and completed any courses or earned any certificates during this 5-day period, the standard fee for those completed courses/certificates will be deducted from your refund amount.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            All refund requests must be submitted to {TERMS_EMAIL}.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Disclaimers and Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            {WEBSITE_NAME} is provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or free of viruses or other harmful components. We make no guarantees regarding specific learning outcomes or professional results from using our platform.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            To the greatest extent permitted by law, {WEBSITE_NAME}, its affiliates, or their licensors, service providers, employees, agents, officers, or directors will not be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the platform, any websites linked to it, any content on the platform or such other websites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Termination of Accounts</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            We reserve the right to suspend or terminate your account and access to {WEBSITE_NAME} at our sole discretion, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Reasons for termination may include, but are not limited to, violation of these Terms, fraudulent activity, or any activity that harms the integrity of the platform or other users.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Please note that users do not currently have the feature to delete their own accounts directly from the platform. For account-related inquiries, please contact us at the email provided below.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Governing Law and Dispute Resolution</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            These Terms shall be governed by and construed in accordance with the laws of Myanmar, without regard to its conflict of law principles.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Any dispute, controversy, or claim arising out of or relating to these Terms or your use of {WEBSITE_NAME} shall first be resolved amicably through good faith negotiations between the parties. If an amicable resolution cannot be reached, such disputes shall be settled by the courts located in Yangon, Myanmar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Changes to These Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. We will notify you of any changes by posting the updated Terms on this page. Your continued use of the platform after such changes constitutes your acceptance of the new Terms. It is your responsibility to review these Terms periodically for changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul className="text-gray-700 mt-2 list-none">
            <li>
              <strong>Email:</strong> <a href={`mailto:${TERMS_EMAIL}`} className="text-blue-600 hover:underline">{TERMS_EMAIL}</a>
            </li>
          </ul>
        </section>

        <p className="text-sm text-gray-500 text-center mt-12">
          Last Updated: September 6, 2025
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
