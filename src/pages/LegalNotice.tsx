import { motion } from 'framer-motion';

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 sm:pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Legal Notice</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Company Information</h2>
              <p>Gourmet Haven GmbH</p>
              <p>Musterstrasse 123</p>
              <p>1234 Vienna</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Contact</h2>
              <p>Phone: +43 123 456 789</p>
              <p>Email: info@gourmethaven.com</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Represented by</h2>
              <p>Managing Director: Max Mustermann</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Commercial Register</h2>
              <p>Registered in the commercial register.</p>
              <p>Registration court: Vienna</p>
              <p>Registration number: HRB 123456</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">VAT ID</h2>
              <p>VAT identification number:</p>
              <p>DE 123 456 789</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalNotice;
