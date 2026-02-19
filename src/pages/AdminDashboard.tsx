import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import {
  Loader2, Plus, Trash2, Clock, Pencil, Eye, EyeOff, Users, Mail, Phone,
  ChevronDown, Settings, Save, LogOut, CalendarDays, UtensilsCrossed,
  ClipboardList, Table2, CheckCircle2, XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Calendar } from "../components/ui/calendar";
import { cn } from "../lib/utils";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Reservation {
  id: string;
  date: string;
  time: string;
  name: string;
  guests: number;
  email?: string;
  phone?: string;
  special_requests?: string;
  status: 'confirmed' | 'pending';
}

interface MenuItem {
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

interface ReservationDay {
  date: Date;
  reservations: Reservation[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface NewReservation {
  name: string;
  email: string;
  guests: number;
  time: string;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
}

type TabId = 'reservations' | 'menu' | 'hours' | 'settings';

/** Parse a date string from Supabase (e.g. "2026-02-26") into a local Date */
function parseLocalDate(d: unknown): Date {
  if (d instanceof Date) return d;
  const s = String(d ?? '');
  // Take only the YYYY-MM-DD portion to avoid timezone issues
  const iso = s.slice(0, 10);
  const parsed = new Date(iso + 'T00:00:00');
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('reservations');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [selectedReservations, setSelectedReservations] = useState<Reservation[]>([]);
  const [calendarDates, setCalendarDates] = useState<ReservationDay[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [newReservation, setNewReservation] = useState<NewReservation>({
    name: '',
    email: '',
    guests: 1,
    time: ''
  });
  const [savingHours, setSavingHours] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [menuItemCount, setMenuItemCount] = useState(0);

  // Flatten all reservations for stats
  const allReservations = useMemo(() =>
    calendarDates.flatMap(day => day.reservations),
    [calendarDates]
  );

  const todayCount = useMemo(() =>
    allReservations.filter(r => isToday(parseLocalDate(r.date))).length,
    [allReservations]
  );

  const pendingCount = useMemo(() =>
    allReservations.filter(r => r.status === 'pending').length,
    [allReservations]
  );

  const totalTables = useMemo(() => {
    const setting = systemSettings.find(s => s.key === 'total_tables');
    return setting?.value ?? '—';
  }, [systemSettings]);

  const upcomingReservations = useMemo(() => {
    const today = startOfDay(new Date());
    return allReservations
      .filter(r => !isBefore(parseLocalDate(r.date), today))
      .sort((a, b) => {
        const dateCompare = parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return (a.time || '').localeCompare(b.time || '');
      })
      .slice(0, 8);
  }, [allReservations]);

  const parsedSettings = useMemo(() => ({
    total_tables: parseInt(systemSettings.find(s => s.key === 'total_tables')?.value || '10'),
    reservation_duration: parseInt(systemSettings.find(s => s.key === 'reservation_duration')?.value || '120'),
    time_slot_interval: parseInt(systemSettings.find(s => s.key === 'time_slot_interval')?.value || '30')
  }), [systemSettings]);

  useEffect(() => {
    fetchOpeningHours();
    fetchSystemSettings();
    fetchMenuItemCount();
  }, []);

  const fetchMenuItemCount = async () => {
    try {
      const { count, error } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      if (error) throw error;
      setMenuItemCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching menu item count:', error);
    }
  };

  const fetchOpeningHours = async () => {
    try {
      const { data, error } = await supabase
        .from('opening_hours')
        .select('*')
        .order('id');

      if (error) throw error;

      if (data && data.length > 0) {
        setOpeningHours(data);
      } else {
        const defaultHours = getDefaultOpeningHours();
        await initializeOpeningHours(defaultHours);
        setOpeningHours(defaultHours);
      }
    } catch (error) {
      console.error('Error loading opening hours:', error);
      alert('Error loading opening hours');
    }
  };

  const getDefaultOpeningHours = (): OpeningHours[] => {
    const days = [
      { id: 'monday', day: 'Monday' },
      { id: 'tuesday', day: 'Tuesday' },
      { id: 'wednesday', day: 'Wednesday' },
      { id: 'thursday', day: 'Thursday' },
      { id: 'friday', day: 'Friday' },
      { id: 'saturday', day: 'Saturday' },
      { id: 'sunday', day: 'Sunday' }
    ];

    return days.map(({ id, day }) => ({
      id,
      day,
      open: '09:00',
      close: '22:00',
      closed: false
    }));
  };

  const initializeOpeningHours = async (hours: OpeningHours[]) => {
    try {
      const { error } = await supabase
        .from('opening_hours')
        .insert(hours);

      if (error) throw error;
    } catch (error) {
      console.error('Error initializing opening hours:', error);
    }
  };

  const handleUpdateOpeningHours = async (id: string, updates: Partial<OpeningHours>) => {
    setSavingHours(true);
    try {
      const { error } = await supabase
        .from('opening_hours')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setOpeningHours(prev =>
        prev.map(hour => (hour.id === id ? { ...hour, ...updates } : hour))
      );
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving opening hours');
    } finally {
      setSavingHours(false);
    }
  };

  useEffect(() => {
    fetchAllReservations();
  }, []);

  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date');

      if (error) throw error;

      const reservations = data || [];
      const days: ReservationDay[] = [];

      reservations.forEach(reservation => {
        const date = parseLocalDate(reservation.date);
        const existingDay = days.find(day => isSameDay(day.date, date));

        if (existingDay) {
          existingDay.reservations.push(reservation);
        } else {
          days.push({
            date,
            reservations: [reservation]
          });
        }
      });

      setCalendarDates(days);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const reservationsForDate = calendarDates.find(day =>
      isSameDay(day.date, selectedDate)
    )?.reservations || [];

    setSelectedReservations(reservationsForDate);
  }, [selectedDate, calendarDates]);

  const generateAdminTimeSlots = () => {
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const dayHours = openingHours.find(h => h.id === dayName);

    if (!dayHours || dayHours.closed) {
      setSelectedTimeSlots([]);
      return;
    }

    const [startHour, startMinute] = dayHours.open.split(':').map(Number);
    const [endHour, endMinute] = dayHours.close.split(':').map(Number);

    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMinute, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0);

    const existingReservations = calendarDates.find(day =>
      isSameDay(day.date, selectedDate)
    )?.reservations || [];

    const slots: TimeSlot[] = [];
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm');
      let tablesInUse = 0;
      const slotStartTime = new Date(currentTime);
      const slotEndTime = new Date(slotStartTime.getTime() + parsedSettings.reservation_duration * 60000);

      existingReservations.forEach(reservation => {
        const resStart = new Date(`${String(reservation.date).slice(0, 10)}T${reservation.time || '00:00'}`);
        const resEnd = new Date(resStart.getTime() + parsedSettings.reservation_duration * 60000);

        if (slotStartTime < resEnd && resStart < slotEndTime) {
          tablesInUse++;
        }
      });

      slots.push({
        time: timeString,
        available: tablesInUse < parsedSettings.total_tables
      });

      currentTime = new Date(currentTime.getTime() + parsedSettings.time_slot_interval * 60000);
    }

    setSelectedTimeSlots(slots);
  };

  useEffect(() => {
    if (openingHours.length > 0) {
      generateAdminTimeSlots();
    }
  }, [selectedDate, calendarDates, openingHours, parsedSettings]);

  const isRestaurantClosed = (date: Date) => {
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const dayHours = openingHours.find(hours => hours.id === dayOfWeek);
    return dayHours?.closed || false;
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      setSelectedReservations(prev =>
        prev.filter(res => res.id !== reservationId)
      );

      setCalendarDates(prev =>
        prev.map(day => ({
          ...day,
          reservations: day.reservations.filter(res => res.id !== reservationId)
        }))
      );
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Error deleting reservation');
    }
  };

  const handleToggleReservationStatus = async (reservation: Reservation) => {
    const newStatus = reservation.status === 'confirmed' ? 'pending' : 'confirmed';
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservation.id);

      if (error) throw error;

      const updateReservation = (r: Reservation) =>
        r.id === reservation.id ? { ...r, status: newStatus as 'confirmed' | 'pending' } : r;

      setSelectedReservations(prev => prev.map(updateReservation));
      setCalendarDates(prev =>
        prev.map(day => ({
          ...day,
          reservations: day.reservations.map(updateReservation)
        }))
      );

      toast.success(newStatus === 'confirmed' ? 'Reservation confirmed' : 'Reservation set to pending');
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Error updating reservation status');
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          date: format(selectedDate, 'yyyy-MM-dd'),
          ...newReservation,
          status: 'confirmed'
        }]);

      if (error) throw error;

      fetchAllReservations();
      setShowReservationModal(false);
      setNewReservation({ name: '', email: '', guests: 1, time: '' });
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Error creating reservation');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  // ─── Stats Cards ───────────────────────────────────────────────

  const statsCards = [
    {
      label: "Today's Reservations",
      value: todayCount,
      icon: CalendarDays,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Pending Reservations',
      value: pendingCount,
      icon: ClipboardList,
      bg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Active Menu Items',
      value: menuItemCount,
      icon: UtensilsCrossed,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Tables',
      value: totalTables,
      icon: Table2,
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'reservations', label: 'Reservations' },
    { id: 'menu', label: 'Menu' },
    { id: 'hours', label: 'Opening Hours' },
    { id: 'settings', label: 'Settings' },
  ];

  // ─── Menu Management (inner component) ─────────────────────────

  const MenuManagement = () => {
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filter, setFilter] = useState({
      category: 'all',
      status: 'all',
      search: ''
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const [newItem, setNewItem] = useState({
      name: '',
      description: '',
      price: '',
      category: 'main',
      active: true,
      image_path: '',
    });

    const categories = [
      { id: 'all', name: 'All Categories' },
      { id: 'starters', name: 'Starters' },
      { id: 'main', name: 'Main Courses' },
      { id: 'desserts', name: 'Desserts' },
      { id: 'drinks', name: 'Drinks' },
    ];

    const statusOptions = [
      { id: 'all', name: 'All Status' },
      { id: 'active', name: 'Active' },
      { id: 'inactive', name: 'Inactive' }
    ];

    useEffect(() => {
      fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category')
          .order('name');

        if (error) throw error;
        setMenuItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (editingItem?.id) {
          const { error } = await supabase
            .from('menu_items')
            .update({
              name: newItem.name,
              description: newItem.description,
              price: parseFloat(newItem.price),
              category: newItem.category,
              active: newItem.active,
              image_path: newItem.image_path
            })
            .eq('id', editingItem.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('menu_items')
            .insert([{
              name: newItem.name,
              description: newItem.description,
              price: parseFloat(newItem.price),
              category: newItem.category,
              active: newItem.active,
              image_path: newItem.image_path
            }]);

          if (error) throw error;
        }

        await fetchMenuItems();
        fetchMenuItemCount();
        setEditingItem(null);
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: 'main',
          active: true,
          image_path: '',
        });
      } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Error saving menu item');
      } finally {
        setLoading(false);
      }
    };

    const filteredItems = useMemo(() => {
      const searchTerm = filter.search.toLowerCase().trim();
      return menuItems.filter(item => {
        const matchesCategory = filter.category === 'all' || item.category === filter.category;
        const matchesStatus = filter.status === 'all' ||
          (filter.status === 'active' && item.active) ||
          (filter.status === 'inactive' && !item.active);
        const matchesSearch = !searchTerm ||
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesStatus && matchesSearch;
      });
    }, [menuItems, filter]);

    const handleDeleteMenuItem = async (id: string) => {
      if (!confirm('Are you sure you want to delete this dish?')) return;
      try {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchMenuItems();
        fetchMenuItemCount();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Error deleting menu item');
      }
    };

    const toggleMenuItemStatus = async (id: string, currentActive: boolean) => {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({ active: !currentActive })
          .eq('id', id);

        if (error) throw error;
        await fetchMenuItems();
        fetchMenuItemCount();
      } catch (error) {
        console.error('Error toggling menu item status:', error);
        alert('Error changing status');
      }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);

        setNewItem(prev => ({
          ...prev,
          image_path: publicUrl
        }));

      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
      }
    };

    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Menu Management</h2>
          <button
            onClick={() => {
              setNewItem({
                name: '',
                description: '',
                price: '',
                category: 'main',
                active: true,
                image_path: '',
              });
              setEditingItem({
                id: '',
                name: '',
                description: '',
                price: 0,
                category: 'main',
                active: true,
                image_path: '',
              } as MenuItem);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Add Dish
          </button>
        </div>

        {/* Filter Area */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {categories.find(cat => cat.id === filter.category)?.name || 'All Categories'}
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setFilter(prev => ({ ...prev, category: category.id }));
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "block w-full px-4 py-2 text-sm text-left hover:bg-gray-100",
                        filter.category === category.id ? "bg-orange-50 text-orange-700" : "text-gray-700"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {statusOptions.find(s => s.id === filter.status)?.name || 'All Status'}
                <ChevronDown className="w-5 h-5 ml-2" />
              </button>

              {isStatusDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  {statusOptions.map((status) => (
                    <button
                      key={status.id}
                      onClick={() => {
                        setFilter(prev => ({ ...prev, status: status.id }));
                        setIsStatusDropdownOpen(false);
                      }}
                      className={cn(
                        "block w-full px-4 py-2 text-sm text-left hover:bg-gray-100",
                        filter.status === status.id ? "bg-orange-50 text-orange-700" : "text-gray-700"
                      )}
                    >
                      {status.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name or description..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg border h-[200px] flex flex-col justify-between",
                  item.active ? "bg-white" : "bg-gray-50"
                )}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">{categories.find(c => c.id === item.category)?.name}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <span className="font-medium text-orange-600 ml-2 whitespace-nowrap">
                      {item.price.toFixed(2)} &euro;
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className={cn(
                    "text-sm px-2 py-1 rounded-full",
                    item.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {item.active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setNewItem({
                          name: item.name,
                          description: item.description,
                          price: item.price.toString(),
                          category: item.category,
                          active: item.active,
                          image_path: item.image_path,
                        });
                      }}
                      className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => toggleMenuItemStatus(item.id, item.active)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title={item.active ? "Deactivate" : "Activate"}
                    >
                      {item.active ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No dishes found
          </div>
        )}

        {/* Modal for Edit/Create */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                Edit Dish
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (&euro;)
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newItem.active}
                    onChange={(e) => setNewItem({ ...newItem, active: e.target.checked })}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Active (visible on menu)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                  {newItem.image_path && (
                    <div className="mt-2">
                      <img
                        src={newItem.image_path}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {(isDropdownOpen || isStatusDropdownOpen) && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => {
              setIsDropdownOpen(false);
              setIsStatusDropdownOpen(false);
            }}
          />
        )}
      </div>
    );
  };

  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSystemSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSetting = async (id: string, value: string) => {
    setIsSettingsLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Setting updated successfully');
      await fetchSystemSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Error updating setting');
    } finally {
      setIsSettingsLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Admin Header Bar ─────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Stats Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className={cn("rounded-xl p-4 sm:p-5", card.bg)}
            >
              <div className="flex items-center gap-3 mb-2">
                <card.icon className={cn("h-5 w-5", card.iconColor)} />
                <span className="text-sm font-medium text-gray-600">{card.label}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ───────────────────────────────── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────── */}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
              <div className="w-full lg:w-1/2">
                <div className="bg-white p-2 sm:p-4 rounded-lg border overflow-x-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date: Date | undefined) => {
                      if (date && !isRestaurantClosed(date)) {
                        setSelectedDate(date);
                      }
                    }}
                    modifiers={{
                      closed: (date: Date) => isRestaurantClosed(date),
                      hasReservations: (date: Date) => {
                        const count = calendarDates.find(day => isSameDay(day.date, date))?.reservations.length || 0;
                        return count > 0;
                      }
                    }}
                    modifiersClassNames={{ closed: "rdp-closed" }}
                  />
                </div>

                {/* Upcoming Reservations */}
                <div className="mt-4 bg-white rounded-lg border p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-orange-500" />
                    Upcoming Reservations
                  </h3>
                  {upcomingReservations.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingReservations.map((res) => (
                        <div
                          key={res.id}
                          onClick={() => setSelectedDate(parseLocalDate(res.date))}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center bg-orange-50 text-orange-600 rounded-lg w-11 h-11 flex-shrink-0">
                            <span className="text-xs font-medium leading-none">{format(parseLocalDate(res.date), 'MMM')}</span>
                            <span className="text-base font-bold leading-none mt-0.5">{format(parseLocalDate(res.date), 'd')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{res.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {res.time && (
                                <>
                                  <Clock className="h-3 w-3" />
                                  <span>{res.time}</span>
                                  <span className="text-gray-300">|</span>
                                </>
                              )}
                              <Users className="h-3 w-3" />
                              <span>{res.guests}</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                            res.status === 'confirmed'
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          )}>
                            {res.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No upcoming reservations</p>
                  )}
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-4 h-[350px] sm:h-[400px] md:h-[600px] overflow-y-auto">
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    Reservations on {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>

                  {/* Time Slots */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Available times:</h4>
                      <button
                        onClick={() => setShowReservationModal(true)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        New Reservation
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedTimeSlots.map((slot) => (
                        <div
                          key={slot.time}
                          onClick={() => {
                            if (slot.available) {
                              setNewReservation(prev => ({ ...prev, time: slot.time }));
                              setShowReservationModal(true);
                            }
                          }}
                          className={cn(
                            "p-2 text-center rounded-md text-xs sm:text-sm",
                            slot.available
                              ? "bg-white hover:bg-gray-50 cursor-pointer"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          {slot.time}
                          {!slot.available && " (Booked)"}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Existing Reservations */}
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-600" />
                    </div>
                  ) : selectedReservations.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {selectedReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="bg-white p-3 sm:p-4 rounded-lg shadow-sm hover:shadow transition-shadow text-sm sm:text-base"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">{reservation.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                {reservation.time}
                                <span className="text-gray-300">|</span>
                                <Users className="h-4 w-4 flex-shrink-0" />
                                {reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}
                              </div>
                              {reservation.email && (
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                  <Mail className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{reservation.email}</span>
                                </p>
                              )}
                              {reservation.phone && (
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{reservation.phone}</span>
                                </p>
                              )}
                              {reservation.special_requests && (
                                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2 italic">
                                  <ClipboardList className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{reservation.special_requests}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-start gap-1 sm:gap-2 ml-2 flex-shrink-0">
                              {/* Status toggle button */}
                              {reservation.status === 'pending' ? (
                                <button
                                  onClick={() => handleToggleReservationStatus(reservation)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                  title="Confirm reservation"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleReservationStatus(reservation)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                                  title="Mark as pending"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Pending
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteReservation(reservation.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                title="Delete reservation"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                      No reservations for this date
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <MenuManagement />
          </div>
        )}

        {/* Opening Hours Tab */}
        {activeTab === 'hours' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Opening Hours</h2>
            <div className="overflow-x-auto">
              <div className="flex flex-nowrap gap-3 sm:gap-4 min-w-max">
                {openingHours.map((hours) => (
                  <div
                    key={hours.id}
                    className="flex-none w-[250px] sm:w-[280px] p-4 sm:p-6 rounded-lg border transition-colors bg-white hover:shadow-md"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b">
                        <h3 className="font-semibold text-lg text-gray-900">{hours.day}</h3>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleUpdateOpeningHours(hours.id, {
                              closed: !e.target.checked
                            })}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className={cn(
                            "text-sm font-medium px-3 py-1 rounded-full",
                            hours.closed
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          )}>
                            {hours.closed ? "Closed" : "Open"}
                          </span>
                        </label>
                      </div>

                      <div className={cn(
                        "grid grid-cols-2 gap-4 transition-all",
                        hours.closed ? "opacity-50 pointer-events-none" : "opacity-100"
                      )}>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-2">
                            Opens at
                          </label>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleUpdateOpeningHours(hours.id, {
                              open: e.target.value
                            })}
                            className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 h-10"
                            disabled={hours.closed}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-2">
                            Closes at
                          </label>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleUpdateOpeningHours(hours.id, {
                              close: e.target.value
                            })}
                            className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 h-10"
                            disabled={hours.closed}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {savingHours && (
              <div className="mt-6 flex items-center justify-center text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Saving changes...
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="bg-gray-50 p-4 rounded-lg space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {setting.description}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={setting.value}
                      onChange={(e) => {
                        const newSettings = systemSettings.map(s =>
                          s.id === setting.id ? { ...s, value: e.target.value } : s
                        );
                        setSystemSettings(newSettings);
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => updateSetting(setting.id, setting.value)}
                      disabled={isSettingsLoading}
                      className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700
                        transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* New Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              New Reservation for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newReservation.name}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newReservation.email}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newReservation.guests}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  required
                  value={newReservation.time}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Please select</option>
                  {selectedTimeSlots
                    .filter(slot => slot.available)
                    .map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.time}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
