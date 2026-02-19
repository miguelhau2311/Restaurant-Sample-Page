import { Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 sm:pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Contact</h1>

          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Email</h2>
                <a
                  href="mailto:info@gourmethaven.com"
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                >
                  info@gourmethaven.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Address</h2>
                <p className="text-gray-600">
                  Musterstrasse 123<br />
                  1234 Vienna
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Phone</h2>
                <a
                  href="tel:+43123456789"
                  className="text-orange-600 hover:text-orange-700 transition-colors"
                >
                  +43 123 456 789
                </a>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-6 sm:mt-8 rounded-xl overflow-hidden h-[220px] sm:h-[300px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2659.3334832076464!2d16.37223231562928!3d48.20832857922864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476d079f79adf79d%3A0x3c34c8bdc5cbd291!2sStephansplatz%2C%201010%20Wien!5e0!3m2!1sde!2sat!4v1643835229居4"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Restaurant Location"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
