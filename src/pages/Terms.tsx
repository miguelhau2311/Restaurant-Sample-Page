import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 sm:pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Terms and Conditions</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">1. Scope</h2>
              <p>These Terms and Conditions apply to all orders and reservations at Gourmet Haven.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">2. Contract Formation</h2>
              <p>By reserving a table, a binding contract is established between the guest and Gourmet Haven.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">3. Reservations</h2>
              <p>Reservations can be made by phone, email, or through our online reservation system.</p>
              <p className="mt-2">For delays of more than 15 minutes, we reserve the right to cancel the reservation.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">4. Cancellations</h2>
              <p>Cancellations are free of charge up to 24 hours before the reservation time.</p>
              <p className="mt-2">For later cancellations or no-shows, we reserve the right to charge a fee.</p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">5. Prices and Payment</h2>
              <p>All prices are in euros and include applicable VAT.</p>
              <p className="mt-2">We accept cash as well as common debit and credit cards.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
