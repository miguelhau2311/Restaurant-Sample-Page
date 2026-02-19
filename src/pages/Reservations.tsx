import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { Calendar } from "../components/ui/calendar";
import { motion } from "framer-motion";
import { Clock, Users, CalendarDays, ChevronLeft, Phone, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";
import { sendReservationEmail } from "../lib/sendReservationEmail";

interface OpeningHours {
  id: string;
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  tablesRemaining: number;
  totalTables: number;
}

interface SystemSettings {
  total_tables: number;
  seats_per_table: number;
  reservation_duration: number;
  min_reservation_notice: number;
  time_slot_interval: number;
}

interface ConfirmedReservation {
  name: string;
  email: string;
  phone: string;
  guests: number;
  time: string;
  date: string;
  notes: string;
}

const isInPast = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const Reservations: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reservationData, setReservationData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    time: "",
    notes: ""
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<ConfirmedReservation | null>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    total_tables: 10,
    seats_per_table: 4,
    reservation_duration: 120,
    min_reservation_notice: 60,
    time_slot_interval: 30
  });

  useEffect(() => {
    fetchOpeningHours();
    fetchSystemSettings();
  }, []);

  const fetchOpeningHours = async () => {
    const { data, error } = await supabase
      .from('opening_hours')
      .select('*')
      .order('id');
    if (!error && data) {
      setOpeningHours(data);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      if (data) {
        setSettings({
          total_tables: parseInt(data.find(s => s.key === 'total_tables')?.value || '10'),
          seats_per_table: parseInt(data.find(s => s.key === 'seats_per_table')?.value || data.find(s => s.key === 'max_guests_per_table')?.value || '4'),
          reservation_duration: parseInt(data.find(s => s.key === 'reservation_duration')?.value || '120'),
          min_reservation_notice: parseInt(data.find(s => s.key === 'min_reservation_notice')?.value || '60'),
          time_slot_interval: parseInt(data.find(s => s.key === 'time_slot_interval')?.value || '30')
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const generateTimeSlots = async (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = openingHours.find(h => h.id === dayName);

    if (!dayHours || dayHours.closed) return [];

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = dayHours.open.split(':').map(Number);
    const [endHour, endMinute] = dayHours.close.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0);

    const { data: existingReservations } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', format(date, 'yyyy-MM-dd'));

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm');

      let tablesInUse = 0;
      const slotStartTime = new Date(currentTime);
      const slotEndTime = new Date(slotStartTime.getTime() + settings.reservation_duration * 60000);

      existingReservations?.forEach(reservation => {
        const resStart = new Date(`${reservation.date}T${reservation.time}`);
        const resEnd = new Date(resStart.getTime() + settings.reservation_duration * 60000);

        if (slotStartTime < resEnd && resStart < slotEndTime) {
          tablesInUse++;
        }
      });

      const now = new Date();
      const minutesUntilSlot = (slotStartTime.getTime() - now.getTime()) / (1000 * 60);
      const isInFuture = minutesUntilSlot >= settings.min_reservation_notice;

      slots.push({
        time: timeString,
        available: tablesInUse < settings.total_tables && isInFuture,
        tablesRemaining: Math.max(0, settings.total_tables - tablesInUse),
        totalTables: settings.total_tables
      });

      currentTime = new Date(currentTime.getTime() + settings.time_slot_interval * 60000);
    }

    return slots;
  };

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setReservationData(prev => ({ ...prev, time: "" }));
    setCurrentStep(2);
    setSlotsLoading(true);
    try {
      const slots = await generateTimeSlots(date);
      setTimeSlots(slots);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setReservationData(prev => ({ ...prev, time }));
    setCurrentStep(3);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    if (!isValidEmail(reservationData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitLoading(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: reservationData.time,
          name: reservationData.name,
          email: reservationData.email,
          phone: reservationData.phone || null,
          guests: reservationData.guests,
          special_requests: reservationData.notes || null,
          status: 'pending'
        }]);

      if (error) throw error;

      // Send confirmation email + notify restaurant (non-blocking)
      sendReservationEmail("received", {
        name: reservationData.name,
        email: reservationData.email,
        phone: reservationData.phone || undefined,
        guests: reservationData.guests,
        date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
        time: reservationData.time,
        special_requests: reservationData.notes || undefined,
      });

      setConfirmedReservation({
        name: reservationData.name,
        email: reservationData.email,
        phone: reservationData.phone,
        guests: reservationData.guests,
        time: reservationData.time,
        date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
        notes: reservationData.notes
      });

      setCurrentStep(4);
      toast.success('Your reservation has been submitted successfully!');
    } catch (error: unknown) {
      console.error('Error creating reservation:', error);
      const msg = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String((error as Record<string, unknown>).message) : 'Unknown error';
      toast.error(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStartOver = () => {
    setReservationData({ name: "", email: "", phone: "", guests: 1, time: "", notes: "" });
    setSelectedDate(undefined);
    setTimeSlots([]);
    setConfirmedReservation(null);
    setCurrentStep(1);
  };

  const isRestaurantClosed = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayHours = openingHours.find(h => h.id === dayName);
    return dayHours?.closed || false;
  };

  const steps = [
    { number: 1, label: "Date" },
    { number: 2, label: "Time" },
    { number: 3, label: "Details" },
    { number: 4, label: "Confirmed" }
  ];

  const ReservationSummary = () => (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-orange-100">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Reservation Summary</h3>
      <div className="space-y-3">
        {selectedDate && (
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
        )}
        {reservationData.time && (
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{reservationData.time}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">{reservationData.guests} {reservationData.guests === 1 ? 'Guest' : 'Guests'}</span>
        </div>
      </div>
    </div>
  );

  const availableSlots = timeSlots.filter(s => s.available);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[25vh] sm:h-[30vh] bg-black">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center md:bg-fixed"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3")'
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">Reserve Your Table</h1>
              <p className="text-base sm:text-lg text-gray-200">Enjoy an unforgettable evening with us</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6 sm:mb-8 md:mb-12">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors",
                    currentStep >= step.number
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {currentStep > step.number ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.number}
                  </div>
                  <span className={cn(
                    "ml-2 text-sm font-medium hidden sm:inline",
                    currentStep >= step.number ? "text-orange-600" : "text-gray-400"
                  )}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-8 sm:w-12 h-0.5 mx-2 sm:mx-3",
                      currentStep > step.number ? "bg-orange-600" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 1: Select Date ─────────────────────────── */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-[480px]">
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-orange-600 to-orange-500 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-6 w-6 text-white/80" />
                      <div>
                        <h2 className="text-white font-bold text-lg">Select a Date</h2>
                        <p className="text-orange-100 text-sm">Choose when you'd like to dine</p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar body */}
                  <div className="px-3 sm:px-5 py-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => isInPast(date) || isRestaurantClosed(date)}
                      modifiers={{ closed: (date: Date) => !isInPast(date) && isRestaurantClosed(date) }}
                      modifiersClassNames={{ closed: "rdp-closed" }}
                    />
                  </div>

                  {/* Legend footer */}
                  <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-orange-600 shadow-sm" />
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full ring-2 ring-inset ring-orange-400" />
                      <span>Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-100">
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="w-[7px] h-[1.5px] bg-red-300 rounded-full" />
                        </div>
                      </div>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Select Time ─────────────────────────── */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to date selection
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Time Slots */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                      <div className="flex items-center mb-6 pb-4 border-b">
                        <Clock className="h-5 w-5 text-orange-500 mr-3" />
                        <h2 className="text-xl font-semibold">Choose a Time</h2>
                      </div>

                      {slotsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <svg className="animate-spin h-8 w-8 text-orange-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <p className="text-gray-500 text-sm">Loading available times...</p>
                        </div>
                      ) : availableSlots.length === 0 && timeSlots.length === 0 ? (
                        <div className="text-center py-12">
                          <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 mb-2">No available time slots for this date.</p>
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Choose a different date
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => slot.available && handleTimeSelect(slot.time)}
                              className={cn(
                                "p-3 rounded-xl text-left transition-all border",
                                slot.available
                                  ? "bg-white hover:border-orange-300 hover:shadow-md cursor-pointer border-gray-200"
                                  : "bg-gray-50 border-gray-100 cursor-not-allowed opacity-60"
                              )}
                            >
                              <p className={cn(
                                "font-semibold text-base",
                                slot.available ? "text-gray-900" : "text-gray-400"
                              )}>
                                {slot.time}
                              </p>
                              {slot.available && slot.tablesRemaining <= 2 ? (
                                <p className="text-xs text-orange-600 font-medium mt-1">
                                  Only {slot.tablesRemaining} {slot.tablesRemaining === 1 ? 'table' : 'tables'} left!
                                </p>
                              ) : slot.available ? (
                                <p className="text-xs text-gray-500 mt-1">
                                  {slot.tablesRemaining} tables available
                                </p>
                              ) : slot.tablesRemaining === 0 ? (
                                <p className="text-xs text-gray-400 mt-1">Fully booked</p>
                              ) : (
                                <p className="text-xs text-gray-400 mt-1">Unavailable</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-8">
                      <ReservationSummary />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Your Details ────────────────────────── */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => {
                    setReservationData(prev => ({ ...prev, time: "" }));
                    setCurrentStep(2);
                  }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to time selection
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                      <div className="flex items-center mb-6 pb-4 border-b">
                        <Users className="h-5 w-5 text-orange-500 mr-3" />
                        <h2 className="text-xl font-semibold">Your Details</h2>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              required
                              value={reservationData.name}
                              onChange={(e) => setReservationData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Number of Guests</label>
                            <select
                              value={reservationData.guests}
                              onChange={(e) => setReservationData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            >
                              {Array.from({ length: settings.seats_per_table }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              required
                              value={reservationData.email}
                              onChange={(e) => setReservationData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Phone <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="tel"
                                inputMode="tel"
                                placeholder="+43 123 456 7890"
                                value={reservationData.phone}
                                onChange={(e) => {
                                  // Strip everything except digits
                                  const digits = e.target.value.replace(/\D/g, '');
                                  if (digits.length === 0) {
                                    setReservationData(prev => ({ ...prev, phone: '' }));
                                    return;
                                  }
                                  // Auto-format as +CC XXX XXX XXXX
                                  const cc = digits.slice(0, 2);
                                  const rest = digits.slice(2);
                                  let formatted = `+${cc}`;
                                  if (rest.length > 0) formatted += ` ${rest.slice(0, 3)}`;
                                  if (rest.length > 3) formatted += ` ${rest.slice(3, 6)}`;
                                  if (rest.length > 6) formatted += ` ${rest.slice(6, 10)}`;
                                  setReservationData(prev => ({ ...prev, phone: formatted }));
                                }}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Notes <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <textarea
                            value={reservationData.notes}
                            onChange={(e) => setReservationData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any special requests or dietary requirements..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            rows={3}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700
                            transition-all disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center"
                        >
                          {submitLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </span>
                          ) : (
                            'Confirm Reservation'
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Summary Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-8">
                      <ReservationSummary />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Confirmation ────────────────────────── */}
            {currentStep === 4 && confirmedReservation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-md w-full max-w-lg text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-5">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h2>
                  <p className="text-gray-500 mb-8">Your table has been reserved. A confirmation email has been sent.</p>

                  <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Name</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto">{confirmedReservation.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto text-right">{confirmedReservation.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Time</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto">{confirmedReservation.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Guests</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto">
                        {confirmedReservation.guests} {confirmedReservation.guests === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>
                    {confirmedReservation.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Phone</span>
                        <span className="text-sm font-medium text-gray-900 ml-auto">{confirmedReservation.phone}</span>
                      </div>
                    )}
                    {confirmedReservation.notes && (
                      <div className="flex items-start gap-3 pt-2 border-t">
                        <span className="text-sm text-gray-600">Notes</span>
                        <span className="text-sm text-gray-700 ml-auto text-right">{confirmedReservation.notes}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStartOver}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Make Another Reservation
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reservations;
