import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { ChefHat, Star, Clock, UtensilsCrossed, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

interface FeaturedDish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
  image_path: string;
}

interface OpeningHours {
  id: string;
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

const Home: React.FC = () => {
  const [featuredDishes, setFeaturedDishes] = useState<FeaturedDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);

  useEffect(() => {
    fetchFeaturedDishes();
    fetchOpeningHours();
  }, []);

  const fetchFeaturedDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedDishes(data || []);
    } catch (error) {
      console.error('Error fetching featured dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpeningHours = async () => {
    try {
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .order('id');

      if (error) throw error;
      setOpeningHours(data || []);
    } catch (error) {
      console.error('Error fetching opening hours:', error);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-screen bg-black"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center md:bg-fixed"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Welcome to<br/>
              <span className="text-orange-500">Gourmet Haven</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-12 max-w-2xl text-gray-200">
              Experience culinary excellence in every bite.
              Our passion for food meets exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <Link
                to="/reservations"
                className="group bg-orange-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-md text-base sm:text-lg font-semibold hover:bg-orange-700 transition-all duration-300 inline-flex items-center text-center"
              >
                Reserve a Table
                <Calendar className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/menu"
                className="group bg-white text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-md text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center text-center"
              >
                View Menu
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features */}
      <div className="py-12 sm:py-16 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Gourmet Haven?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes us special and let our passion for excellent cuisine convince you.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            <Feature
              icon={<ChefHat className="h-8 w-8" />}
              title="Master Chefs"
              description="Our kitchen team brings years of experience from world-renowned restaurants."
            />
            <Feature
              icon={<UtensilsCrossed className="h-8 w-8" />}
              title="Fresh Ingredients"
              description="We use only the finest local and seasonal ingredients for our dishes."
            />
            <Feature
              icon={<Clock className="h-8 w-8" />}
              title="Perfect Timing"
              description="Fast service without compromising on quality and presentation."
            />
          </div>
        </div>
      </div>

      {/* Featured Dishes */}
      <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-4"
        >
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Recommendations</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our carefully selected specialties,
              prepared with love by our chefs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              featuredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group relative bg-white rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-64 overflow-hidden">
                    <img
                      src={dish.image_path}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="relative p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{dish.name}</h3>
                      <span className="text-lg font-bold text-orange-600">
                        &euro;{dish.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{dish.description}</p>
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
                      {dish.category.charAt(0).toUpperCase() + dish.category.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <div className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Guests Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Authentic reviews from guests who have already experienced our culinary journey.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial
              text="The best dining experience I've had in years. The attention to detail is remarkable."
              author="Sarah Johnson"
              rating={5}
            />
            <Testimonial
              text="Exceptional service and atmosphere. Every dish was a masterpiece."
              author="Michael Chen"
              rating={5}
            />
            <Testimonial
              text="A hidden gem! The wine pairing suggestions were perfect."
              author="Emma Davis"
              rating={5}
            />
          </div>
        </div>
      </div>

      {/* Opening Hours & Address */}
      <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Opening Hours */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8"
            >
              <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
                <Clock className="h-8 w-8 text-orange-500" />
                <h3 className="text-2xl font-bold ml-4">Opening Hours</h3>
              </div>
              <div className="space-y-4">
                {openingHours.map((hours) => (
                  <div
                    key={hours.id}
                    className="flex justify-between items-center border-b border-gray-100 pb-4"
                  >
                    <span className="text-base sm:text-lg text-gray-600">{hours.day}</span>
                    <span className="text-base sm:text-lg font-medium">
                      {hours.closed ? (
                        <span className="text-red-500">Closed</span>
                      ) : (
                        <span className="text-gray-900">{hours.open} - {hours.close}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Address & Contact */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8"
            >
              <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
                <MapPin className="h-8 w-8 text-orange-500" />
                <h3 className="text-2xl font-bold ml-4">How to Find Us</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                  <p className="text-base sm:text-lg text-gray-600">Musterstrasse 123</p>
                  <p className="text-base sm:text-lg text-gray-600">1234 Vienna</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Reservation</h4>
                  <Link
                    to="/reservations"
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 text-lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Reserve online
                  </Link>
                </div>
                <div className="mt-8">
                  <div className="h-48 sm:h-64 rounded-lg overflow-hidden">
                    <iframe
                      title="Restaurant Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2659.3334832076464!2d16.37223231562928!3d48.20832857922864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476d079f79adf79d%3A0x3c34c8bdc5cbd291!2sStephansplatz%2C%201010%20Wien!5e0!3m2!1sde!2sat!4v1643835229居4"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <img
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Restaurant Interior"
                className="w-full h-[250px] sm:h-[350px] md:h-[500px] object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Fine Dining"
                className="w-full h-[180px] sm:h-[240px] object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Wine Selection"
                className="w-full h-[180px] sm:h-[240px] object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
              <img
                src="https://images.unsplash.com/photo-1542834291-c514e77b215f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Chef at Work"
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              <img
                src="https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Dessert"
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              <img
                src="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Restaurant Atmosphere"
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover rounded-lg hover:opacity-90 transition-opacity md:block hidden"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Our Chef"
                className="rounded-2xl shadow-2xl w-full h-[300px] sm:h-[400px] lg:h-[600px] object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Chef's Special</h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
                Discover the exquisite creations of our head chef,
                inspired by local ingredients and international influences.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700"
              >
                Explore the Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="group text-center hover:bg-orange-50 p-5 sm:p-6 md:p-8 rounded-xl transition-colors duration-300"
  >
    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const Testimonial = ({ text, author, rating }: { text: string; author: string; rating: number }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
        {author[0]}
      </div>
      <div className="ml-4">
        <p className="font-semibold text-gray-900">{author}</p>
        <div className="flex mt-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
    </div>
    <p className="text-gray-600 italic">"{text}"</p>
  </motion.div>
);

export default Home;
