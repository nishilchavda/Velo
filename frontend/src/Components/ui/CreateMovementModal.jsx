import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Sparkles, Loader2, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../../api";
import { toast } from "react-toastify";

// Fix Leaflet marker icon issue in React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ position, setPosition, setDestinationName }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.country;
            setDestinationName(city);
          }
        });
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const CreateMovementModal = ({ isOpen, onClose, onCreated, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [position, setPosition] = useState(null); 
  
  const [formData, setFormData] = useState({
    destinationName: "",
    startDate: "",
    endDate: "",
    vibeTags: "",
    imageUrl: ""
  });
  
  const resetForm = () => {
    setFormData({ destinationName: "", startDate: "", endDate: "", vibeTags: "", imageUrl: "" });
    setPosition(null);
  };
  
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        destinationName: initialData.destination.name,
        startDate: new Date(initialData.startDate).toISOString().split('T')[0],
        endDate: new Date(initialData.endDate).toISOString().split('T')[0],
        vibeTags: initialData.vibeTags.join(", "),
        imageUrl: initialData.imageUrl || ""
      });
      setPosition([initialData.destination.coordinates.coordinates[1], initialData.destination.coordinates.coordinates[0]]);
    } else if (!initialData && isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const handleSearch = async () => {
    if (!formData.destinationName) return;
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.destinationName)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        const nameParts = display_name.split(",");
        setFormData(prev => ({ ...prev, destinationName: nameParts[0] + (nameParts[1] ? "," + nameParts[1] : "") }));
      } else {
        toast.error("Location not found.");
      }
    } catch (err) {
      toast.error("Geocoding failed.", err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      toast.error("Please select a location on the map!");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        destinationName: formData.destinationName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        vibeTags: formData.vibeTags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        imageUrl: formData.imageUrl,
        longitude: position[1],
        latitude: position[0]
      };

      if (initialData) {
        await api.put(`/movement/edit/${initialData._id}`, payload);
        toast.success("Expedition updated!");
      } else {
        await api.post("/movement/create", payload);
        toast.success("Expedition synchronized!");
      }
      
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
          >
            {/* Left Side: Map Selection */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100">
              <MapContainer 
                center={position || [20, 0]} 
                zoom={position ? 12 : 2} 
                style={{ height: "100%", width: "100%" }}
                className="z-10"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker 
                  position={position} 
                  setPosition={setPosition} 
                  setDestinationName={(name) => setFormData(prev => ({...prev, destinationName: name}))} 
                />
              </MapContainer>
            </div>

            {/* Right Side: Form Details */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="bg-linear-to-br from-brand to-secondary p-4 text-white relative">
                <button 
                  onClick={onClose}
                  className="absolute right-2 top-3 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <h2 className="text-3xl font-display text-white tracking-tight leading-none">
                  {initialData ? "Edit your " : "Where to "}<span className="italic">{initialData ? "journey" : "next?"}</span>
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Destination</label>
                  <div className="relative flex gap-2">
                    <div className="relative flex-1 group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
                      <input 
                        required
                        type="text"
                        className="w-full bg-orange-50 border-2 border-orange-100/50 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-stone-900 focus:border-brand focus:bg-white outline-none transition-all"
                        value={formData.destinationName}
                        onChange={(e) => setFormData({...formData, destinationName: e.target.value})}
                      />
                    </div>
                    <button type="button" onClick={handleSearch} disabled={geocoding} className="p-3.5 bg-stone-900 text-white rounded-2xl">
                      {geocoding ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start</label>
                    <input 
                      required type="date"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-xs font-bold text-gray-900 focus:border-brand focus:bg-white outline-none"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">End</label>
                    <input 
                      required type="date"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-xs font-bold text-gray-900 focus:border-brand focus:bg-white outline-none"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vibes</label>
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:border-brand focus:bg-white outline-none"
                    value={formData.vibeTags}
                    onChange={(e) => setFormData({...formData, vibeTags: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Expedition Image URL</label>
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-900 focus:border-brand focus:bg-white outline-none"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                </div>

                <button 
                  disabled={loading || !position}
                  type="submit"
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                  {loading ? "Saving..." : initialData ? "Update Expedition" : "Sync Movement"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateMovementModal;
