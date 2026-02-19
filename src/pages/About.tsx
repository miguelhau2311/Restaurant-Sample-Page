import { motion } from 'framer-motion';
import { ChefHat, Award, Users, Leaf } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] bg-black">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center md:bg-fixed"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-3xl"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                Our Story
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200">
                Since 1995, we have been serving authentic cuisine with passion and innovation
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3"
                alt="Restaurant History"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Tradition Meets Innovation</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">
                What began as a small family restaurant has evolved into a culinary
                institution. Our kitchen combines traditional recipes with
                modern cooking techniques and innovative interpretations.
              </p>
              <p className="text-gray-600 text-base sm:text-lg">
                Every dish tells a story and reflects our passion
                for extraordinary flavor experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide us every day in the preparation of our dishes
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard
              icon={<ChefHat className="h-8 w-8" />}
              title="Quality"
              description="Only the finest ingredients for our dishes"
            />
            <ValueCard
              icon={<Award className="h-8 w-8" />}
              title="Excellence"
              description="Highest standards in preparation and service"
            />
            <ValueCard
              icon={<Users className="h-8 w-8" />}
              title="Hospitality"
              description="Warm service and a welcoming atmosphere"
            />
            <ValueCard
              icon={<Leaf className="h-8 w-8" />}
              title="Sustainability"
              description="Responsible use of resources"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              The people behind our culinary creations
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TeamMember
              image="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3"
              name="Marcus Schmidt"
              role="Head Chef"
              description="With over 20 years of experience in fine dining"
            />
            <TeamMember
              image="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3"
              name="Laura Weber"
              role="Sous Chef"
              description="Specialized in modern Italian cuisine"
            />
            <TeamMember
              image="https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-4.0.3"
              name="Thomas Mueller"
              role="Pastry Chef"
              description="Creates our award-winning desserts"
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <img
              src="https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3"
              alt="Restaurant Impression"
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3"
              alt="Fine Dining"
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3"
              alt="Interior"
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1542834291-c514e77b215f?ixlib=rb-4.0.3"
              alt="Kitchen"
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const ValueCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="text-orange-500 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const TeamMember = ({ image, name, role, description }: { image: string; name: string; role: string; description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
  >
    <div className="h-56 sm:h-72 md:h-80 overflow-hidden">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <p className="text-orange-600 font-medium mb-3">{role}</p>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

export default About;
