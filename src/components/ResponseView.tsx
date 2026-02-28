import { useState, useEffect } from 'react';
import { Sparkles, Calendar as CalendarIcon, Map as MapIcon, MapPin, SendHorizontal, Utensils, Train, Compass, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { PlaceOverview } from '@googlemaps/extended-component-library/react';
import type { ItineraryResponse } from '../services/mock-data';

// Web Component types for Google Maps Extended Component Library
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-details-compact': any;
      'gmp-place-details-place-request': any;
      'gmp-place-all-content': any;
    }
  }
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'food':
    case 'food_drink':
      return <Utensils size={12} />;
    case 'transport':
      return <Train size={12} />;
    case 'sightseeing':
    case 'culture':
      return <Landmark size={12} />;
    case 'wander':
      return <Compass size={12} />;
    default:
      return <Compass size={12} />;
  }
};

const formatTime = (utcString: string) => {
  const date = new Date(utcString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function ResponseView({ itinerary, onEditItinerary }: { itinerary: ItineraryResponse; onEditItinerary: (userPrompt: string) => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'map'>('calendar');
  const [askInput, setAskInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  // Controlled Map State
  const initialLat = itinerary.itinerary.length > 0 ? itinerary.itinerary[0].latitude : 40.4168;
  const initialLng = itinerary.itinerary.length > 0 ? itinerary.itinerary[0].longitude : -3.7038;
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });
  const [mapZoom, setMapZoom] = useState(12);
  
  // Map index -> Place ID
  const [resolvedPlaceIds, setResolvedPlaceIds] = useState<Record<number, string>>({});

  const toggleItem = (id: string) => {
    setExpandedItemId(prev => prev === id ? null : id);
  };

  const zoomToPlace = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setMapZoom(16);
    // On mobile, maybe close the sheet partially or fully to see the map
    setIsSheetOpen(false);
    setActiveTab('map');
  };

  // Internal component to use Map Context for PlacesService
  const PlacesIdResolver = () => {
    const placesLibrary = useMapsLibrary('places');

    useEffect(() => {
      if (!placesLibrary || !placesLibrary.Place) return;

      itinerary.itinerary.forEach(async (item, idx) => {
        // If we already have a place_id in the JSON, or we already resolved it, skip
        if (item.place_id || resolvedPlaceIds[idx]) {
          if (item.place_id && !resolvedPlaceIds[idx]) {
             setResolvedPlaceIds(prev => ({ ...prev, [idx]: item.place_id as string }));
          }
          return;
        }

        // Search using the venue name to get the closest match using the NEW Places API
        const request = {
          textQuery: item.venue_name,
          fields: ['id'],
        };

        try {
          const { places } = await placesLibrary.Place.searchByText(request);
          if (places && places.length > 0) {
            setResolvedPlaceIds(prev => ({ ...prev, [idx]: places[0].id }));
          }
        } catch (error) {
          console.error("Error finding place ID:", error);
        }
      });
    }, [placesLibrary, itinerary.itinerary]);

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfdfc] relative w-full pt-8">
      
      {/* Ask More Header Component */}
      <div className="px-5 pt-3 pb-4 bg-white/80 backdrop-blur-xl z-20 sticky top-0 border-b border-stone-100 flex flex-col gap-3 shrink-0 rounded-t-3xl shadow-sm relative pt-8">
        <h1 className="font-serif text-2xl font-bold text-stone-900 mt-2">Your Itienary</h1>
        <div className="relative flex items-center shadow-sm rounded-2xl overflow-hidden bg-stone-100/80 border border-stone-200/60 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-rust-500/30 focus-within:border-rust-500/30">
          <div className="pl-3 pr-2 text-rust-500">
            <Sparkles size={18} />
          </div>
          <input 
            type="text"
            className="flex-1 py-3.5 bg-transparent border-none outline-none text-[15px] text-stone-800 placeholder:text-stone-400 font-medium"
            placeholder="Ask Gemini to edit timeline..."
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            disabled={isEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && askInput.trim() && !isEditing) {
                setIsEditing(true);
                onEditItinerary(askInput.trim()).finally(() => {
                  setIsEditing(false);
                  setAskInput('');
                });
              }
            }}
          />
          <button 
            className={`pr-3 pl-2 transition-colors ${isEditing ? 'text-stone-300 cursor-not-allowed' : askInput.trim() ? 'text-rust-500 hover:text-rust-600' : 'text-stone-400 hover:text-rust-500'}`}
            disabled={isEditing || !askInput.trim()}
            onClick={() => {
              if (!askInput.trim() || isEditing) return;
              setIsEditing(true);
              onEditItinerary(askInput.trim()).finally(() => {
                setIsEditing(false);
                setAskInput('');
              });
            }}
          >
            {isEditing ? (
              <div className="w-5 h-5 border-2 border-stone-300 border-t-rust-500 rounded-full animate-spin" />
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="px-5 py-4 pb-0 z-10 sticky top-[130px] shrink-0 bg-[#fdfdfc]">
        <div className="flex p-1 bg-stone-100 rounded-full">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'calendar' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <CalendarIcon size={16} /> Timeline
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'map' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <MapIcon size={16} /> Map
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 min-h-0 basis-0 w-full relative">
        <AnimatePresence mode="wait">
          {activeTab === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto p-5 pb-24"
            >
              <div className="mb-10 last:mb-0">
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-stone-200 ml-4">
                  {itinerary.itinerary.map((item, j) => {
                    const itemId = `item-${j}`;
                    const isExpanded = expandedItemId === itemId;
                    
                    return (
                      <div key={j} className="relative">
                        <div className="absolute w-3 h-3 bg-white border-2 border-rust-500 rounded-full -left-[23px] top-2" />
                        <div 
                          onClick={() => toggleItem(itemId)}
                          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:border-rust-200 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-rust-500 bg-rust-50 px-2.5 py-1 rounded-md">
                              {getCategoryIcon(item.category)} {formatTime(item.start_utc)}
                            </div>
                            {item.estimated_cost && item.estimated_cost !== '0 EUR' && (
                              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                                {item.estimated_cost}
                              </span>
                            )}
                          </div>
                          
                          <p className="font-bold text-lg text-stone-900 leading-tight mb-1 group-hover:text-rust-600 transition-colors">{item.activity_name}</p>
                          
                          <div className="flex items-center gap-1.5 text-sm text-stone-500 font-medium">
                            <MapPin size={14} className="text-stone-400 shrink-0" />
                            <span className="truncate">{item.venue_name}</span>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3 border-t border-stone-100">
                                  <p className="text-sm text-stone-600 leading-relaxed mb-3">
                                    {item.description}
                                  </p>
                                  {item.transport_to_next && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100 mb-3">
                                       <Train size={14} className="text-stone-400" /> {item.transport_to_next}
                                    </div>
                                  )}
                                  <a 
                                    href={item.google_maps_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="block text-center w-full py-2 bg-stone-100 text-stone-700 rounded-xl text-sm font-semibold hover:bg-stone-200 transition-colors"
                                  >
                                    View on Map
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-200 overflow-hidden"
            >
              {/* Interactive Google Map */}
              <div className="absolute inset-0">
                <Map
                  zoom={mapZoom}
                  onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
                  center={mapCenter}
                  onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                  mapId="DEMO_MAP_ID"
                  disableDefaultUI={true}
                >
                  <PlacesIdResolver />
                  {itinerary.itinerary.map((item, idx) => (
                    <AdvancedMarker 
                      key={idx} 
                      position={{ lat: item.latitude, lng: item.longitude }}
                      onClick={() => console.log('Clicked', item.activity_name)}
                      className="group"
                    >
                      <div className="relative flex flex-col items-center hover:-translate-y-1 transition-transform cursor-pointer drop-shadow-md">
                        {/* Number Badge */}
                        <div className="bg-rust-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ring-2 ring-white z-10 group-hover:bg-rust-600 transition-colors">
                          {idx + 1}
                        </div>
                        {/* Pointer tail */}
                        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-rust-500 -mt-[2px] group-hover:border-t-rust-600 transition-colors" />
                      </div>
                    </AdvancedMarker>
                  ))}
                </Map>
              </div>

              {/* Collapsable Bottom Sheet */}
              <motion.div 
                className="absolute left-0 right-0 bottom-0 bg-stone-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-stone-200 flex flex-col pointer-events-auto z-30"
                animate={{ height: isSheetOpen ? '75%' : '140px' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div 
                  className="w-full flex justify-center py-4 cursor-pointer bg-white rounded-t-3xl sticky top-0 z-10"
                  onClick={() => setIsSheetOpen(!isSheetOpen)}
                >
                  <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
                </div>
                
                <div className="px-5 py-4 shrink-0 flex items-center justify-between bg-white border-b border-stone-100">
                  <h3 className="font-serif font-bold text-xl text-stone-900">Points of Interest</h3>
                </div>

                <div className="overflow-y-auto flex-1 pb-10">
                  <div className="flex flex-col">
                    {itinerary.itinerary.map((_item, idx) => {
                      let placeIdToRender = resolvedPlaceIds[idx];
                      if (!placeIdToRender) return null; // Wait until resolved

                      // Strip 'places/' prefix if it accidentally got included
                      if (placeIdToRender.startsWith('places/')) {
                        placeIdToRender = placeIdToRender.replace('places/', '');
                      }

                      return (
                        <div key={idx} className="border-b border-stone-200 bg-white hover:bg-stone-50 transition-colors relative flex flex-col pb-4">
                           <div className="w-full">
                             <PlaceOverview size="small" place={placeIdToRender}></PlaceOverview>
                           </div>
                           <div className="flex gap-2.5 px-5 pt-1 w-full justify-start">
                             <button 
                               onClick={(e) => { e.preventDefault(); zoomToPlace(_item.latitude, _item.longitude); }}
                               className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-[10px] transition-colors"
                             >
                               <Compass size={16} className="text-stone-500" /> View on Map
                             </button>
                             <a 
                               href={_item.google_maps_url} 
                               target="_blank"
                               rel="noreferrer"
                               className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rust-50 border border-rust-100 hover:bg-rust-100/80 text-rust-600 font-semibold text-sm rounded-[10px] transition-colors"
                             >
                               <SendHorizontal size={16} className="text-rust-500" /> Directions
                             </a>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
