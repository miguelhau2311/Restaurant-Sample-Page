import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 sm:pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">1. Privacy at a Glance</h2>
              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">General Information</h3>
              <p>The following information provides a simple overview of what happens to your personal data when you visit this website.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">2. Data Collection on Our Website</h2>
              <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">Cookies</h3>
              <p>Our website uses cookies. These are small text files that your web browser stores on your device.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">3. Your Rights</h2>
              <p>You have the right at any time to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Request information about your stored personal data</li>
                <li>Request the correction of your stored data</li>
                <li>Request the deletion of your personal data</li>
                <li>Request the restriction of processing of your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">4. Contact</h2>
              <p>If you have questions about data privacy, you can contact us at any time:</p>
              <p className="mt-2">Email: privacy@gourmethaven.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
