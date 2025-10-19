import { WEBSITE_NAME, PRIVACY_POLICY_EMAIL } from "../../constants";
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Privacy Policy
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to {WEBSITE_NAME}! We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. By registering an account and using our platform, you agree to the terms of this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            When you register an account with {WEBSITE_NAME}, we collect the following personal information:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li className="mb-1">
              <strong>Email Address:</strong> Used for account verification, course enrollment notifications, completion certificates, important platform updates, and other essential communications related to your learning activities.
            </li>
            <li className="mb-1">
              <strong>Full Name:</strong> To personalize your experience, identify you within the platform, and for any certificates or official documents you may receive.
            </li>
            <li className="mb-1">
              <strong>Birth Year:</strong> Collected to understand the age demographics of our active learners. This helps us analyze user engagement and tailor our educational content to different age groups.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            This information is collected directly from you during the initial account registration process. You can update your Name and Email Address in your profile settings at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li className="mb-1">To create and manage your user account.</li>
            <li className="mb-1">To provide you with access to our e-learning courses and platform features.</li>
            <li className="mb-1">To send you important communications regarding your courses, such as enrollment confirmations, progress updates, and completion notifications.</li>
            <li className="mb-1">To personalize your learning experience.</li>
            <li className="mb-1">To analyze user demographics and activity patterns to improve our platform and course offerings.</li>
            <li className="mb-1">To ensure the security and integrity of our platform.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your personal information for as long as your account remains active on our platform to provide you with continuous access to our services and your learning history. If you choose to delete your account, your personal data will be removed in accordance with our data retention policies and legal obligations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Your Choices and Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            You have the ability to update your Name and Email Address through your profile settings on the platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Please note that the collection of your Email Address, Name, and Birth Year is essential for the functionality of our e-learning platform. **If you choose to opt out of providing or maintaining this core information, you will not be able to use our platform.**
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">7. No Third-Party Sharing</h2>
          <p className="text-gray-700 leading-relaxed">
            We value your privacy. We do not share, sell, rent, or trade your personal information with any third parties for their marketing or any other purposes. Your data is used solely for the operation and improvement of {WEBSITE_NAME}.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new Privacy Policy on this page and/or through other communication channels. Your continued use of the platform after such changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </p>
          <ul className="text-gray-700 mt-2 list-none">
            <li>
              <strong>Email:</strong> <a href={`mailto:${PRIVACY_POLICY_EMAIL}`} className="text-blue-600 hover:underline">{PRIVACY_POLICY_EMAIL}</a>
            </li>
            {/* <li>
              <strong>Address:</strong> {WEBSITE_NAME}, Dagon Township, Yangon, 11011, Myanmar
            </li> */}
          </ul>
        </section>

        <p className="text-sm text-gray-500 text-center mt-12">
          Last Updated: September 6, 2025
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
