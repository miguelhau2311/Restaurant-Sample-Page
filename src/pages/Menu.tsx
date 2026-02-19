import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_path: string;
  active: boolean;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      setMenuItems(data || []);
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] bg-black">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center md:bg-fixed"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3")'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">Our Menu</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200">Discover our culinary creations</p>
          </motion.div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
          <motion.div
            className="relative"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
              <div className="flex flex-nowrap gap-2 px-4">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`snap-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors
                    ${activeCategory === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'}`}
                >
                  All Dishes
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`snap-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors
                      ${activeCategory === category
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {item.image_path && (
                <div className="relative h-48 sm:h-60 overflow-hidden group">
                  <img
                    src={item.image_path}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-orange-600">
                    &euro;{item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">
              No dishes found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Menu;
