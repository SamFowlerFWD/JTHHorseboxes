import { notFound } from 'next/navigation'
import { loadPricingConfig } from '@/lib/pricing'
import Link from 'next/link'
import Image from 'next/image'
import Hero from '@/components/Hero'
import LightboxGallery from '@/components/Lightbox'

export const runtime = 'edge'
import { Check, Shield, Award, Star, Truck, ChevronRight, Phone, Mail, MapPin, Users, Clock } from 'lucide-react'
import type { Metadata } from 'next'

// Import Schema component at the top
import Schema, { generateProductSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/components/Schema'
import { weightLabel } from '@/lib/models'

/** Stand-in used where a model has no confirmed price; shown as 'Contact for
 *  pricing' and never published to structured data. */
const PRICE_ON_APPLICATION = 12345

// Model-specific content and SEO data
const modelContent: Record<string, {
  title: string
  description: string
  longDescription: string[]
  features: string[]
  /** Intro checklist; falls back to the first four features */
  highlights?: string[]
  /** Warranty length; 24 months unless a model says otherwise */
  warrantyMonths?: number
  specifications: {
    dimensions: Record<string, string>
    weights: Record<string, string>
    safety: string[]
  }
  gallery: string[]
  testimonial?: {
    name: string
    role: string
    quote: string
  }
  seoKeywords: string
  heroImage: string
}> = {
  'professional-35': {
    title: 'Professional 35 - Premium 3.5t Horsebox for Serious Competitors',
    description: 'The JTH Professional 35 is the ultimate 3.5 tonne horsebox for professional riders and serious competitors. Premium features, luxury finish, advanced safety systems. British-built in Norfolk from £22,000.',
    longDescription: [
      'The Professional 35 represents the pinnacle of 3.5 tonne horsebox design and engineering. Built for professional riders, serious competitors, and discerning owners who demand the very best, this model combines luxury, performance, and practicality in a package that can be driven on a standard car license.',
      'Every Professional 35 is handcrafted at our Norfolk facility using the finest materials and components. The premium GRP construction ensures exceptional durability while keeping weight to a minimum, maximizing your available payload for horses and equipment.',
      'The living area in the Professional 35 sets new standards for the 3.5 tonne category. Premium upholstery, solid surface worktops, and thoughtful storage solutions create a comfortable environment for competition days. The horse area features our advanced safety systems including reinforced partitions, premium anti-slip flooring, and comprehensive CCTV monitoring.',
      'Professional riders choose the Professional 35 because it delivers everything needed for successful competition without compromise. From the hydraulic ramp option to the solar power system, every feature has been carefully selected to enhance your equestrian lifestyle. This is more than just transport – it\'s your mobile base for achieving excellence.'
    ],
    features: [
      'Head padding, partition padding, and top door padding',
      'Electric fan with temperature and rain sensor',
      'Loading light as standard',
      'EVA wall matting up to 5 feet',
      'Full aluminium bulkhead at the horse\'s head',
      'Escape doors',
      'Two bench storage seats in the groom\'s area',
      'Reversing camera as standard',
      'Adjustable tie rings',
    ],
    specifications: {
      dimensions: {
        'Overall Length': '6.32m',
        'Overall Width': '2.3m',
        'Overall Height': '3.2m',
        'Internal Height': '2.3m',
      },
      weights: {
        'Gross Weight': '3,500kg',
        'Payload': 'Minimum 1 tonne',
        'Horse Capacity': '1 horse or 2 ponies',
        'Licence': 'Category B (car licence)',
        'Warranty': '2 year build warranty',
      },
      safety: [
        'Triple reinforced bulkhead',
        'Full height gapless, stepless & lightweight ramp',
        'Composite floor',
        'Escape doors',
        'Stallion partition available',
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp'],
    seoKeywords: '3.5t professional horsebox, Professional 35, premium 3.5 tonne horsebox, competition horsebox, luxury horsebox, British horsebox manufacturer, best 3.5t horsebox UK, professional horse transport',
    heroImage: '/models/professional-35/01.webp'
  },
  'principle-35': {
    title: 'Principle 35 - Essential Quality 3.5t Horsebox',
    description: 'The JTH Principle 35 offers the perfect balance of quality and value for discerning horsebox owners. All the safety, less of the thrills. British built 3.5 tonne horsebox from £19,500 + VAT.',
    longDescription: [
      'This entry level horsebox has a reduced specification to keep payload up and the cost down. A crossover of the KPH Aeos QV 35 and the JTH 3.5 Tonne Horsebox range.',
      'The bespoke design allows us to tailor the horse area length and breast bar height specifically for you. In the groom\'s area you\'ll find an extra wide rear groom\'s door, long seat and internal saddle racks and bridle cups.',
      'Customers can add items from a comprehensive list of colours and extras. 12 month warranty included. For the more advanced specification, see the JTH Professional 35.'
    ],
    features: [
      'Reinforced steel bulkhead, welded to chassis',
      'GRP body walls',
      'Fibreglass Luton and 4-piece rear panel',
      '30mm insulated roof sheet',
      'Aluminium plank floor',
      'Stallion partition with twin doors into groom\'s area',
      '7mm one-piece rubber floor mat',
      'Horse area camera',
      '20mm EVA wall matting in horse area',
      'Minimum 3 points of ventilation, including a roof vent',
      'Three windows with built-in window bars',
      '4 internal tie rings',
      'Full size rear emergency exit',
      'Loading light and calming blue travel lighting',
      'Ultra-lightweight gapless ramp, reinforced with steel',
      'Wheel arch protectors',
      '2 saddle racks and 2 bridle hooks',
    ],
    highlights: [
      'Reinforced steel bulkhead, welded to chassis',
      'Secondary aluminium bulkhead with twin escape doors',
      '20mm EVA wall matting in horse area',
      'Aluminium plank floor',
    ],
    warrantyMonths: 12,
    specifications: {
      dimensions: {
        'Overall Length': '6.32m',
        'Overall Width': '2.3m',
        'Overall Height': '3.1m',
        'Internal Height': '2.2m',
      },
      weights: {
        'Gross Weight': '3,500kg',
        'Payload': '1.1 tonnes on average',
        'Horse Capacity': '1 horse or 2 ponies',
        'Licence': 'Category B (car licence)',
        'Warranty': '1 year build warranty',
      },
      safety: [
        'Triple reinforced bulkhead',
        'Gapless, stepless & lightweight ramp with barn doors',
        'Aluminium floor',
        'Secondary aluminium bulkhead with full size twin escape doors',
        'Stallion stall built as standard',
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp'],
    seoKeywords: '3.5t horsebox, value horsebox, Principle 35, affordable horsebox, British horsebox, 3.5 tonne horsebox for sale',
    heroImage: '/models/principle-35/01.webp'
  },
  'progeny-35': {
    title: 'Progeny 35 - Crew Cab 3.5t Horsebox with Up to 7 Seats',
    description: 'The JTH Progeny 35 is a crew cab 3.5 tonne horsebox seating up to 7 passengers — 2-3 in the front and up to 4 in the rear crew cab. Top of the range specification. British-built in Norfolk from £25,500.',
    longDescription: [
      'The Progeny 35 is our top of the range 3.5 tonne crew cab horsebox, designed for teams, families, and professionals who need to transport both horses and passengers in comfort. With seating for up to 7 — 2-3 in the front and up to 4 in the rear crew cab — everyone travels together.',
      'Building on the Professional 35 platform, the Progeny adds a full crew cab with premium materials throughout, advanced technology features, and bespoke customization options that set it apart from any other horsebox in its class.',
      'For owners who demand the absolute best, the Progeny 35 delivers an unmatched combination of crew cab practicality, luxury finish, and British engineering excellence.'
    ],
    features: [
      'Crew cab — up to 7 seats',
      '2-3 front seats, up to 4 rear crew cab seats',
      'Premium specification throughout',
      'Premium leather upholstery',
      'Day living as standard',
      'Premium paint and graphics',
      'CCTV monitoring system',
      'Hydraulic ramp option'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.0m',
        'Overall Width': '2.3m',
        'Overall Height': '3.2m',
        'Internal Height': '2.3m',
        'Horse Area': '3.8m'
      },
      weights: {
        'Gross Weight': '3,500kg',
        'Payload': '1,200kg',
        'Horse Capacity': '2 Horses',
        'Seating': 'Up to 7 (2-3 front + up to 4 rear crew cab)'
      },
      safety: [
        'Advanced CCTV system',
        'Emergency exit doors',
        'Premium anti-slip flooring',
        'LED lighting throughout',
        'Reinforced construction',
        'GPS tracking system'
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp'],
    seoKeywords: '3.5t crew cab horsebox, Progeny 35, crew cab horsebox 7 seats, premium horsebox, top specification horsebox, best 3.5 tonne horsebox, team horsebox',
    heroImage: '/models/progeny-35/01.webp'
  },
  'aeos-edge-45': {
    title: 'Aeos Edge 45 - Compact 4.5t Horsebox with Generous Payload',
    description: 'The Aeos Edge 45 is a compact 4.5 tonne horsebox with a generous payload of approximately 1.8 tonnes. Stalled for 2 large horses with adjustable air suspension. British-built in Norfolk.',
    longDescription: [
      'The Aeos Edge 45 is a compact horsebox with a generous payload. Stalled for two large horses (rear facing) with adjustable air suspension for added stability.',
      'The groom\'s area has a large leather seat and lockable wardrobe. Stallion stall version also available (Aeos Edge ST 45).',
      'Built with the same quality and attention to detail as all Aeos models, the Edge 45 offers a practical, professional horsebox solution with all essential safety features included.'
    ],
    features: [
      'Steel construction horse ramp with slip rails',
      'Horse area with drain tube',
      'Green interior running light in horse area',
      'Horse partition with padding and skirt (sliding)',
      'Internal stainless steel tie rings x 3',
      'Internal hay net rings x 2',
      'LED interior lights',
      'Opening roof vent',
      'Luton storage (open)',
      'Horse and reversing camera',
      'Adjustable and removable breast bar (1350–1450mm)',
      'Checker plate under horses head',
      'Equi Travel Safe rails',
      'Low level ventilation for each horse',
      'Large leather seat in groom\'s area',
      'Lockable wardrobe with hanging rail',
      'Leather upholstery in groom\'s area',
      'Solar charging system',
      '800mm escape door to groom\'s area',
      'New alloy wheels with Aeos logo',
      'New deep tread tyres with Puncture Safe gel',
      'Adjustable air suspension',
      'Metallic paint (one colour)',
      'Large exterior tack locker (near side)',
      'Stainless steel saddle racks x 2',
      'Stainless steel bridle cups x 2',
      'External stainless steel tie rings x 2 with protectors',
      'Vinyl HORSES front and rear',
      'Bonded horse windows with stainless steel bars x 2',
    ],
    specifications: {
      dimensions: {
        'Overall Length': '6.70m',
        'Overall Width': '2.3m',
        'Overall Height': '3.4m',
        'Internal Height': '2.4m',
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': 'Approx. 1.8 tonnes',
        'Horse Capacity': '2 large horses (rear facing)',
        'Licence': 'Category C or C1',
        'Warranty': 'JTH 2 year build warranty',
      },
      safety: [
        'Reinforced and double skinned box section off-side wall',
        'Reinforced and double skinned box section bulkhead wall to cab',
        '35mm kick matting on bulkhead wall to cab',
        'Adjustable air suspension',
        '800mm escape door to groom\'s area',
        'Wide 800mm rear door with gas ram',
        'Alloy rear step',
        '12 volt power certificate',
        'Weight certificate',
      ]
    },
    gallery: ['hero.jpg', 'blue-front.jpg', 'layout.jpg'],
    seoKeywords: '4.5t horsebox, Aeos Edge 45, compact 4.5 tonne horsebox, generous payload horsebox, air suspension horsebox, British horsebox, Norfolk horsebox',
    heroImage: '/models/aeos-edge-45/hero.jpg'
  },
  'aeos-freedom-45': {
    title: 'Aeos Freedom 45 - Multipurpose 4.5t Horsebox with Day Living',
    description: 'The Aeos Freedom 45 is a new 4.5 tonne multipurpose horsebox with separate day living area, single bed, and large payload of approximately 1.6 tonnes. Stalled for 2 large horses.',
    longDescription: [
      'The latest addition to the Aeos range, evolved from the Aeos Hybrid (our best selling horsebox). The Freedom 45 works equally well across many disciplines.',
      'Designed to offer a large payload and separate day living area with bed, whilst remaining compact in overall length. Stalled for two large horses (rear facing) with adjustable air suspension.',
      'The living area has a long seat, single bed, wardrobe, sink and hob plus two large overhead lockers. All essentials for overnight stays including a portable toilet and an auxiliary battery system with solar and engine charging.'
    ],
    features: [
      'Steel construction horse ramp with slip rails',
      'Horse area with drain tube',
      'Green interior running light in horse area',
      'Horse partition with padding and skirt (sliding)',
      'Internal stainless steel tie rings x 3',
      'Internal hay net rings x 2',
      'LED interior lights',
      'Opening roof vent',
      'Luton storage (open)',
      'Horse and reversing camera',
      'Breast bar 1350–1450mm high',
      'Checker plate under horses head',
      'Equi Travel Safe rails',
      'Low level ventilation for each horse',
      'Tack area seat/bed (single bed)',
      'Portable toilet stored under seat/bed',
      'Cold water with 95L water tank',
      'Modern glass hob with 2 burner',
      'Sink and flush fitting drawer',
      'Leather seats with lumbar support',
      'Designer wood finish in living area',
      'RGBW LED strip lights and reading lights',
      'Wardrobe with two large overhead lockers',
      'Auxiliary power with solar and engine charging',
      '240 volt hook up with double sockets and mains lead',
      'USB charging points',
      'Opening roof vent with fly screen and blackout blind',
      'Offset bulkhead wall with jockey door',
      'New alloy wheels with Aeos logo',
      'New deep tread tyres with Puncture Safe gel',
      'Adjustable air suspension',
      'Metallic paint (one colour)',
      'Large exterior tack locker (near side)',
      'Stainless steel saddle racks x 2 and bridle cups x 2',
      'External stainless steel tie rings x 2 with protectors',
      'Vinyl HORSES front and rear',
      'Outside water filler',
      'Carbon monoxide CO2 and smoke detector',
      'Fire extinguisher',
    ],
    specifications: {
      dimensions: {
        'Overall Length': '6.70m',
        'Overall Width': '2.3m',
        'Overall Height': '3.4m',
        'Internal Height': '2.4m',
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': 'Approx. 1.6 tonnes',
        'Horse Capacity': '2 large horses (rear facing)',
        'Licence': 'Category C or C1',
        'Warranty': '2 year warranty',
      },
      safety: [
        'Reinforced and double skinned box section off-side wall',
        'Reinforced and double skinned box section bulkhead wall to cab',
        '35mm kick matting on bulkhead wall to cab',
        'Adjustable air suspension',
        'Wide 800mm rear door with gas ram',
        'Alloy rear step',
        'Carbon monoxide CO2 and smoke detector',
        'Fire extinguisher',
        '230 volt, 12 volt, gas and weight certificates',
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp'],
    seoKeywords: '4.5t horsebox with living, Aeos Freedom 45, multipurpose horsebox, day living horsebox, 4.5 tonne horsebox bed, weekend horsebox, Aeos horsebox UK',
    heroImage: '/models/aeos-freedom-45/01.webp'
  },
  'aeos-discovery-45': {
    title: 'Aeos Discovery 45 - Luxury Living 4.5t Horsebox',
    description: 'The spectacular Aeos Discovery 45 combines the features of a motorhome with a horsebox. New design, new materials and a new level of luxury. 7.37m overall length with approx. 1.4 tonne payload.',
    longDescription: [
      'The spectacular Aeos Discovery 45 horsebox is here! New design, new materials and a new level of luxury, combining the features of a motorhome with a horsebox.',
      'Designed as a high end quality 4.5 tonne horsebox with features only normally found on larger 7.5 tonne horseboxes. The largest horsebox in the Aeos range at 7.37 metres (24\' 2") overall length.',
      'Extra length and load allowance handled with adjustable air suspension. Fuel consumption is highly economical with significant reduction in road noise. Equipped with anti-lock brakes, alloy wheels, deep tread tyres filled with Puncture Safe and a very low centre of gravity.'
    ],
    features: [
      'Steel construction horse ramp with slip rails',
      'Green interior running light in horse area',
      'Horse partition with padding and skirt (sliding)',
      'Internal stainless steel tie rings x 3',
      'Internal hay net rings x 2',
      'LED interior lights',
      'Opening roof vent',
      'Luton storage (open)',
      'Horse and reversing camera',
      'Grooms door between living and horse area',
      'Breast bar 1350–1450mm high',
      'Checker plate under horses head',
      'Equi Travel Safe rails',
      'Low level ventilation for each horse',
      'Temperature sensor and monitoring of horse area',
      'Leather seats with lumbar support (removable to make pillows)',
      'Seats/double bed with full storage',
      'Shower and swivel toilet',
      'Bespoke vanity unit with mirror',
      'Hot/cold water with 95L water tank',
      '60 litre fridge',
      'Glass hob with 2 burner and sink',
      'Free standing table with legs',
      'Designer wood finish in living area',
      'RGBW LED strip lights',
      'Window fly screens with blackout blinds',
      'Wardrobe including shoe rack, clothes rail and table storage',
      'Flat screen TV with flush wall mount and digital aerial',
      'Auxiliary power with 150Ah lithium battery',
      'Solar charging to auxiliary battery',
      '240 volt hook up with double sockets and mains lead',
      'USB charging points',
      'Opening roof vent with fly screen and blackout blind',
      '405 watt solar panel',
      'Metallic paint (one colour)',
      'Exterior single tack locker x 2 (near and off side)',
      'Stainless steel saddle racks x 2 and bridle cups x 2',
      'Easy close steel half ramp with 3 slip rails',
      'Top opening half door with 2 gas rams and padding',
      'Top opening half door alarm and light warning',
      'External stainless steel tie rings x 2 with protectors',
      'Horse shower (cold only)',
      'Outside water filler',
      'New alloy wheels with Aeos logo',
      'New deep tread tyres with Puncture Safe gel',
      'Bonded horse windows with stainless steel bars x 2',
      'Bonded living windows x 3 (blackout blind & fly screen)',
      'Vinyl HORSES front and rear',
      'Carbon monoxide CO2 and smoke detector',
      'Fire extinguisher',
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.37m (24\' 2")',
        'Overall Width': '2.3m',
        'Overall Height': '3.5m',
        'Internal Height': '2.4m',
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': 'Approx. 1.4 tonnes',
        'Horse Capacity': '2 large horses (rear facing)',
        'Licence': 'Category C1',
        'Warranty': '2 year warranty',
        'Chassis': 'Sourced to your requirements',
      },
      safety: [
        'Reinforced and double skinned box section off-side wall',
        'Reinforced and double skinned box section bulkhead wall to cab',
        '35mm kick matting on bulkhead wall to cab',
        'Adjustable air suspension',
        'Anti-Lock Braking System (ABS)',
        'Advanced Emergency Braking System (AEBS)',
        'Electronic Brakeforce Distribution (EBD)',
        'Tyre pressure monitoring system',
        'Wide 800mm rear door with gas ram',
        'Carbon monoxide CO2 and smoke detector',
        'Fire extinguisher',
        '230 volt, 12 volt, gas and weight certificates',
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp'],
    seoKeywords: '4.5t luxury horsebox, Aeos Discovery 45, luxury living horsebox, motorhome horsebox, 4.5 tonne horsebox shower toilet, premium horsebox UK, Aeos horsebox, horsebox with living area',
    heroImage: '/models/aeos-discovery-45/01.webp'
  },
  'aeos-edge-st-45': {
    title: 'Aeos Edge ST 45 - Stallion 4.5t Horsebox',
    description: 'The Aeos Edge ST 45 is a compact 4.5 tonne stallion stall horsebox with a generous payload of approximately 1.7 tonnes. Fixed stallion partition with padding.',
    longDescription: [
      'The Aeos Edge ST 45 is a compact 4.5 tonne stallion stall horsebox with a generous payload. Stalled for two large horses (rear facing) with adjustable air suspension.',
      'The groom\'s area has a large leather seat and lockable wardrobe. Standard stall version also available (Aeos Edge 45).',
      'Built with the same quality and attention to detail as all Aeos models, the Edge ST features a fixed stallion partition with padding for safe transport of stallions.'
    ],
    features: [
      'Steel construction horse ramp with slip rails',
      'Horse area with drain tube',
      'Green interior running light in horse area',
      'Stallion stall horse partition with padding (fixed)',
      'Internal stainless steel tie rings x 3',
      'Internal hay net rings x 2',
      'LED interior lights',
      'Opening roof vent',
      'Luton storage (open)',
      'Horse and reversing camera',
      'Adjustable and removable breast bar (1350–1450mm)',
      'Checker plate under horses head',
      'Equi Travel Safe rails',
      'Low level ventilation for each horse',
      'Large leather seat in groom\'s area',
      'Lockable wardrobe with hanging rail',
      'Leather upholstery in groom\'s area',
      'Solar charging system',
      '800mm escape door to groom\'s area',
      'New alloy wheels with Aeos logo',
      'New deep tread tyres with Puncture Safe gel',
      'Adjustable air suspension',
      'Metallic paint (one colour)',
      'Large exterior tack locker (near side)',
      'Stainless steel saddle racks x 2 and bridle cups x 2',
      'External stainless steel tie rings x 2 with protectors',
      'Vinyl HORSES front and rear',
      'Bonded horse windows with stainless steel bars x 2',
    ],
    specifications: {
      dimensions: {
        'Overall Length': '6.70m',
        'Overall Width': '2.3m',
        'Overall Height': '3.4m',
        'Internal Height': '2.4m',
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': 'Approx. 1.7 tonnes',
        'Horse Capacity': '2 large horses (rear facing)',
        'Licence': 'Category C or C1',
        'Warranty': 'JTH 2 year after sales support',
      },
      safety: [
        'Reinforced and double skinned box section off-side wall',
        'Reinforced and double skinned box section bulkhead wall to cab',
        '35mm kick matting on bulkhead wall to cab',
        'Adjustable air suspension',
        '800mm escape door to groom\'s area',
        'Wide 800mm rear door with gas ram',
        'Alloy rear step',
        '12 volt power certificate',
        'Weight certificate',
      ]
    },
    gallery: ['hero.jpg', 'layout.jpg'],
    seoKeywords: '4.5t stallion horsebox, Aeos Edge ST 45, stallion transport horsebox, fixed partition horsebox, stallion stall horsebox UK',
    heroImage: '/models/aeos-edge-st-45/hero.jpg'
  },
  'aeos-discovery-72': {
    title: 'Aeos Discovery 72 - Flagship Luxury Living 7.2t Horsebox',
    description: 'The flagship Aeos Discovery 72 horsebox — combining the best features of a motorhome and a horsebox with a 3 tonne payload.',
    longDescription: [
      'The flagship Aeos Discovery 72 horsebox — combining the best features of a motorhome and a horsebox with a 3 tonne payload.',
      'Designed as a high end quality 7.2 tonne horsebox with features only normally found on larger 7.5 tonne Helios horseboxes. Benefits from luxury living including designer wood finish units, leather upholstery, sink/hob, fridge, TV, large top lockers, under seat storage, spacious double bed and separate shower/toilet.',
      'Two large external tack lockers with two air vents each and insulated doors. The largest horsebox in the Aeos range at 7.37 metres (24\' 2").'
    ],
    features: [
      'Steel construction horse ramp with slip rails',
      'Green interior running light in horse area',
      'Horse partition with padding and skirt (sliding)',
      'Internal stainless steel tie rings x 3',
      'Internal hay net rings x 2',
      'LED interior lights',
      'Opening roof vent',
      'Luton storage (open)',
      'Horse and reversing camera',
      'Grooms door between living and horse area',
      'Breast bar 1350–1450mm high',
      'Checker plate under horses head',
      'Equi Travel Safe rails',
      'Low level ventilation for each horse',
      'Temperature sensor and monitoring of horse area',
      'Leather seats with lumbar support (removable to make pillows)',
      'Seats/double bed with full storage',
      'Shower and swivel toilet',
      'Bespoke vanity unit with mirror',
      'Hot/cold water with 95L water tank',
      '60 litre fridge',
      'Glass hob with 2 burner and sink',
      'Free standing table with legs',
      'Designer wood finish in living area',
      'RGBW LED strip lights',
      'Window fly screens with blackout blinds',
      'Wardrobe including shoe rack, clothes rail and table storage',
      'Flat screen TV with flush wall mount and digital aerial',
      'Auxiliary power with 150Ah lithium battery',
      'Solar charging to auxiliary battery',
      '240 volt hook up with double sockets and mains lead',
      'USB charging points',
      'Opening roof vent with fly screen and blackout blind',
      '410 watt solar panel',
      'Chassis sourced to your requirements',
      'Metallic paint (one colour)',
      'Exterior single tack locker x 2 (near and off side)',
      'Stainless steel saddle racks x 2 and bridle cups x 2',
      'Easy close steel full ramp with 3 slip rails',
      'Top opening half door with 2 gas rams and padding',
      'Top opening half door alarm and light warning',
      'External stainless steel tie rings x 2 with protectors',
      'Horse shower (cold only)',
      'Outside water filler',
      'New deep tread tyres with Puncture Safe gel',
      'Adjustable air suspension',
      'Bonded horse windows with stainless steel bars x 2',
      'Bonded living windows x 3 (blackout blind & fly screen)',
      'Vinyl HORSES front and rear',
      'Carbon monoxide CO2 and smoke detector',
      'Fire extinguisher',
      'Remote central locking',
      'Air conditioning and cruise control',
      'Rear parking sensors',
      'Alloy wheels',
      'Variable power steering',
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.37m (24\' 2")',
        'Overall Width': '2.5m',
        'Overall Height': '3.8m',
        'Internal Height': '2.5m',
      },
      weights: {
        'Gross Weight': '7,200kg',
        'Payload': '3 tonnes',
        'Horse Capacity': '2 large horses (rear facing)',
        'Licence': 'Category C1',
        'Warranty': '2 year warranty',
        'Chassis': 'Sourced to your requirements',
      },
      safety: [
        'Reinforced and double skinned box section off-side wall',
        'Reinforced and double skinned box section bulkhead wall to cab',
        '35mm kick matting on bulkhead wall to cab',
        'Adjustable air suspension',
        'Anti-Lock Braking System (ABS)',
        'Electronic Brakeforce Distribution (EBD)',
        'Anti Slip Regulator (ASR)',
        'Temperature sensor and monitoring of horse area',
        'Wide 800mm rear door with gas ram',
        'Carbon monoxide CO2 and smoke detector',
        'Fire extinguisher',
        '230 volt, 12 volt, gas and weight certificates',
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp', '06.webp', '07.webp', '08.webp'],
    seoKeywords: '7.2t horsebox, 7.2 tonne horsebox, Aeos Discovery 72, luxury horsebox, 3 tonne payload horsebox, professional horsebox, motorhome horsebox',
    heroImage: '/models/aeos-discovery-72/hero.jpg'
  },
  'jth-principle-45': {
    title: 'JTH Principle 45 - Essential 4.5t Horsebox | Basic Back End | Norfolk',
    description: 'JTH Principle 45 - Essential 4.5 tonne horsebox with 4-piece back end. Quality British construction at an affordable price from £28,950. Built in Norfolk. Car license with C1. Configure online.',
    longDescription: [
      'The Principle 45 brings our renowned build quality to the 4.5 tonne category. Featuring our practical 4-piece back end design, this model offers increased payload over 3.5t models while maintaining affordability.',
      'Perfect for riders needing extra capacity without the premium price tag. The 4-piece back end provides easy access and maintenance.',
      'Built with the same British craftsmanship as our premium models, the Principle 45 delivers essential features without compromise on quality or safety.'
    ],
    features: [
      '4.5 tonne gross weight',
      '4-piece back end design', 
      'Increased payload vs 3.5t',
      'Quality GRP construction',
      'British-built in Norfolk',
      'C1 license required',
      '2-year structural warranty',
      'Finance options available'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.2m',
        'Overall Width': '2.3m',
        'Overall Height': '3.4m',
        'Internal Height': '2.3m',
        'Horse Area': '3.8m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': '1,800kg',
        'Horse Capacity': '2-3 horses',
        'Living Area': 'Standard',
        'Chassis': 'Sourced to your requirements'
      },
      safety: [
        'Emergency exit doors',
        'Anti-slip rubber flooring',
        'Internal LED lighting',
        'Padded partitions',
        'Secure door locks',
        'Fire extinguisher included',
        'First aid kit storage'
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp'],
    seoKeywords: 'Principle 45 horsebox, 4.5t basic horsebox, 4.5 tonne entry level, affordable 4.5t horsebox, JTH Principle 45, 4 piece back end, British 4.5t horsebox, Norfolk horsebox builder',
    heroImage: '/models/jth-principle-45/01.webp'
  },
  'jth-professional-45': {
    title: 'JTH Professional 45 - Premium 4.5t Horsebox | Included Extras | Norfolk',
    description: 'JTH Professional 45 - Premium 4.5 tonne horsebox with metallic paint, reversing camera, climate control, and luxury features included. From £31,500. British-built in Norfolk.',
    longDescription: [
      'The Professional 45 takes luxury to the next level with an extensive list of premium features included as standard. Metallic paint, reversing camera, climate control roof fan, and more.',
      'Designed for professional riders who demand the best. Every Professional 45 includes features that competitors charge thousands extra for.',
      'Built with meticulous attention to detail, this model combines luxury, performance, and practicality in the 4.5 tonne category.'
    ],
    features: [
      'Metallic paint included',
      'Reversing camera & monitor',
      'Loading area lights',
      'Horse area LED lights',
      'JTH premium rear end',
      'Luxury seat covers',
      'Climate control roof fan',
      'Horse area padding',
      'Bench seat with storage',
      'Overhead shelf with hanging'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.2m',
        'Overall Width': '2.3m',
        'Overall Height': '3.4m',
        'Internal Height': '2.3m',
        'Horse Area': '3.8m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': '1,800kg',
        'Horse Capacity': '2-3 horses',
        'Living Area': 'Luxury',
        'Chassis': 'Sourced to your requirements'
      },
      safety: [
        'CCTV monitoring system',
        'Emergency exit doors',
        'Premium anti-slip flooring',
        'Internal and external LED lighting',
        'Reinforced partitions',
        'Secure multi-point locks',
        'Fire extinguisher and first aid',
        'Reversing camera system'
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp'],
    seoKeywords: 'Professional 45 horsebox, premium 4.5t horsebox, luxury 4.5 tonne, JTH Professional 45, metallic paint horsebox, reversing camera, climate control horsebox, professional competition horsebox',
    heroImage: '/models/jth-professional-45/01.webp'
  },
  'jth-progeny-45': {
    title: 'JTH Progeny 45 - Crew Cab 4.5t Horsebox | Team Transport | Norfolk',
    description: 'JTH Progeny 45 - Crew cab 4.5 tonne horsebox with single front seat and side windows. Optional external crew cab doors (£240 each). Perfect for teams from £36,500.',
    longDescription: [
      'The Progeny 45 Crew Cab is designed for teams and families. With additional seating, side windows for visibility, and optional external crew cab doors.',
      'Transport your entire team in comfort. The crew cab configuration provides extra seating while maintaining full horse transport capabilities.',
      'Perfect for riding schools, competition teams, and families who need to transport both horses and passengers safely and comfortably.'
    ],
    features: [
      'Crew cab configuration',
      'Single front seat included',
      'Side windows for visibility',
      'Optional external crew doors (£240 each side)',
      'Team/family friendly design',
      'Enhanced passenger comfort',
      'Additional storage options',
      'Full safety features'
    ],
    specifications: {
      dimensions: {
        'Overall Length': '7.4m',
        'Overall Width': '2.3m', 
        'Overall Height': '3.4m',
        'Internal Height': '2.3m',
        'Horse Area': '3.6m'
      },
      weights: {
        'Gross Weight': '4,500kg',
        'Payload': '1,700kg',
        'Horse Capacity': '2 horses',
        'Crew Capacity': '3-4 people',
        'Chassis': 'Sourced to your requirements'
      },
      safety: [
        'Enhanced passenger safety',
        'Crew cab safety features',
        'Emergency exit doors',
        'Anti-slip flooring',
        'LED lighting throughout',
        'Padded partitions',
        'Secure door locks',
        'First aid kit included'
      ]
    },
    gallery: ['01.webp', '02.webp', '03.webp', '04.webp'],
    seoKeywords: 'Progeny 45 horsebox, crew cab horsebox, 4.5t team horsebox, JTH Progeny 45, crew cab horse transport, family horsebox, side windows horsebox, external doors option',
    heroImage: '/models/jth-progeny-45/01.webp'
  },
  'helios-75': {
    title: 'Helios 75 - Premium 7.5 Tonne Horsebox',
    description: 'The JTH Helios 75 is our flagship 7.5 tonne horsebox with luxury apartment-style living, 3 stalls, wet room, full kitchen, and premium specification throughout. British-built in Norfolk.',
    longDescription: [
      'The Helios 75 is the ultimate horsebox for those who demand the very best. This flagship 7.5 tonne model combines apartment-quality living with professional horse transport capabilities, featuring a full wet room, kitchen, and generous living space.',
      'With accommodation for up to 3 horses and luxury living that includes a double bed in the luton, L-shaped seating, full shower/toilet wet room, hob, sink, fridge, and extensive storage — the Helios 75 is designed for extended stays at events and competitions.',
      'Every Helios 75 is built to the highest specification with Coat-X protection in the horse area, 150Ah lithium battery, 410 watt solar panel, and premium finishes throughout. Safety features include a stainless steel safety cage, anti-lock brakes, and comprehensive certification.'
    ],
    features: [
      '3 horse stalls with Coat-X protection',
      'Luxury living with double bed',
      'Full wet room — shower, toilet, fold-down sink',
      'Kitchen — hob, sink, 60L fridge',
      '150Ah lithium battery with solar charging',
      '410 watt solar panel',
      'Whale iVan touch screen controller',
      'Metallic paint finish'
    ],
    specifications: {
      dimensions: {
        'Headroom (Horse Area)': '2.51m (8\' 3")',
        'Living Length': 'Up to 2.5m (8\')',
        'Water Tank': '80 litres',
        'Stall Configuration': '3 stalls (right-hand seat layout)'
      },
      weights: {
        'Gross Weight': '7,500kg',
        'Horse Capacity': '3 Horses',
        'Chassis': 'Sourced to your requirements',
        'Living': 'Apartment-quality'
      },
      safety: [
        'Stainless steel safety cage on centre partition',
        'Anti-lock brakes',
        'Full width ramp — lower load height',
        'Double skinned walls — kick protection',
        '230V, 12V, 24V power certificates',
        'Gas certificate',
        'Weight and calibration certificate',
        'Smoke and CO2 detector'
      ]
    },
    gallery: ['hero.jpg', 'layout.webp'],
    seoKeywords: '7.5t horsebox, Helios 75, luxury horsebox, 3 horse horsebox, 7.5 tonne horsebox with living, premium horsebox, horsebox with shower, horsebox with kitchen',
    heroImage: '/models/helios-75/hero.jpg'
  },
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const content = modelContent[params.slug]
  if (!content) {
    return {
      title: 'Model Not Found | JTH Horseboxes',
      description: 'The requested horsebox model could not be found.'
    }
  }

  return {
    title: content.title,
    description: content.description,
    keywords: content.seoKeywords,
    openGraph: {
      title: content.title,
      description: content.description,
      images: [content.heroImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [content.heroImage],
    },
    alternates: {
      canonical: `https://jthltd.co.uk/models/${params.slug}`,
    },
  }
}

export default async function ModelDetailPage({ params }: { params: { slug: string } }) {
  const content = modelContent[params.slug]
  
  // If no content exists for this model, show 404
  if (!content) {
    return notFound()
  }

  // Try to load pricing config, but don't fail if model isn't in it
  let model: any = null
  let basePrice: number | null = null
  
  try {
    const cfg = await loadPricingConfig()
    model = cfg.models.find(m => m.slug === params.slug)
    if (model && model.basePricePence != null) {
      basePrice = model.basePricePence / 100
    }
  } catch (error) {
    // Pricing config not available or model not in config
    console.log(`Model ${params.slug} not in pricing config, using default pricing`)
  }
  
  // Use default prices if not in pricing config
  if (!basePrice) {
    const defaultPrices: Record<string, number> = {
      'principle-35': 19500,
      'professional-35': 22000,
      'progeny-35': 25500,
      'aeos-qv-45': 28950,
      'aeos-edge-45': PRICE_ON_APPLICATION,
      'aeos-freedom-45': PRICE_ON_APPLICATION,
      'aeos-discovery-45': PRICE_ON_APPLICATION,
      'aeos-freedom-st-45': 38500,
      'aeos-edge-st-45': 33500,
      'aeos-qv-st-45': 30950,
      'aeos-discovery-72': 74600,
      'helios-75': PRICE_ON_APPLICATION,
      'jth-principle-45': 28950,
      'jth-professional-45': 31500,
      'jth-progeny-45': 36500,
    }
    basePrice = defaultPrices[params.slug] || 0
  }
  
  // Use content title as model name if not in pricing config
  const modelName = model?.name || content.title.split(' - ')[0]

  // Determine model category
  const is45t = params.slug.includes('45')
  const is72t = params.slug.includes('72')
  const isStallion = params.slug.includes('-st-')
  
  const modelCategory = weightLabel(params.slug) || '3.5 Tonne'

  const warrantyMonths = content.warrantyMonths ?? 24
  const warrantyShort = warrantyMonths === 24 ? '2 Year' : `${warrantyMonths} Month`
  const warrantyPhrase = warrantyMonths === 24 ? '2-year' : `${warrantyMonths}-month`
  const payload = content.specifications.weights['Payload']

  // Generate FAQ data for this model (now that basePrice is available)
  const modelFAQs = [
    {
      question: `How much does the ${content.title.split(' - ')[0]} cost?`,
      answer: basePrice === PRICE_ON_APPLICATION 
        ? `The ${content.title.split(' - ')[0]} is built to order with pricing based on your exact specifications. Please contact us for a detailed quotation. We offer competitive finance packages and accept part exchange.`
        : `All prices shown are for the body build only, excluding VAT. The base vehicle (van/chassis) is sourced separately to your requirements. Final pricing depends on your chosen options and customisations. Contact us to discuss your complete build.`
    },
    {
      question: `What license do I need to drive this horsebox?`,
      answer: params.slug.includes('35') 
        ? 'The 3.5 tonne models can be driven on a standard car license if you passed your test before 1997. Otherwise, you\'ll need B+E or C1 license.'
        : params.slug.includes('45')
        ? 'The 4.5 tonne models require a C1 license. We can recommend training providers if needed.'
        : 'The 7.2 tonne models require a C1 or full HGV license depending on configuration.'
    },
    {
      question: `What warranty comes with this model?`,
      answer: `Every ${content.title.split(' - ')[0]} comes with our comprehensive ${warrantyPhrase} structural warranty covering all manufacturing defects and structural elements.`
    },
    {
      question: `Can I customize this horsebox?`,
      answer: `Yes, the ${content.title.split(' - ')[0]} can be fully customized to your requirements including paint colors, interior layout, and equipment specifications.`
    }
  ]

  // Generate schema markup
  const breadcrumbs = [
    { name: 'Home', url: 'https://jthltd.co.uk' },
    { name: 'Models', url: 'https://jthltd.co.uk/models' },
    { name: modelName, url: `https://jthltd.co.uk/models/${params.slug}` }
  ]

  const productSchema = generateProductSchema({
    name: modelName,
    description: content.description,
    image: `https://jthltd.co.uk${content.heroImage}`,
    price: basePrice === PRICE_ON_APPLICATION ? null : basePrice,
    sku: params.slug.toUpperCase(),
    category: `${modelCategory} Horsebox`
  })

  return (
    <>
      <Schema schema={[generateBreadcrumbSchema(breadcrumbs), productSchema, generateFAQSchema(modelFAQs)]} />
      <main className="bg-white">
      {/* Hero Section */}
      <Hero 
        primarySrc={content.heroImage}
        fallbackSrc="/models/professional-35/01.webp"
        height="xl"
        overlay="gradient"
      >
        <div className="w-full self-end pb-16 md:pb-24">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[1.04] animate-slideUp">
              {modelName}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed animate-slideUp animation-delay-200">
              {content.description}
            </p>
            {/* A coachline: the fine painted stripe down the flank of a
                coachbuilt body, doubled as it is on the vehicles themselves. */}
            <div className="mt-10 flex flex-col gap-[4px] animate-slideUp animation-delay-200">
              <span className="block h-[2px] w-32 bg-brass-light" />
              <span className="block h-px w-20 bg-brass-light/60" />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 animate-slideUp animation-delay-400">
              <Link
                href="/contact"
                className="btn-on-dark"
              >
                Get a Quote
              </Link>
              <Link
                href="#specifications"
                className="btn-on-dark-outline"
              >
                View Specifications
              </Link>
            </div>
          </div>
        </div>
      </Hero>

      {/* Key Features Bar */}
      <section className="bg-slate-900 py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {basePrice === PRICE_ON_APPLICATION ? 'Contact for pricing' : `£${basePrice.toLocaleString()}`}
              </div>
              <div className="text-sm text-slate-400 tracking-wide">Body Build · exc. VAT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{content.specifications.weights['Gross Weight']}</div>
              <div className="text-sm text-slate-400 tracking-wide">Gross Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{content.specifications.weights['Horse Capacity']}</div>
              <div className="text-sm text-slate-400 tracking-wide">Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{warrantyShort}</div>
              <div className="text-sm text-slate-400 tracking-wide">Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 md:py-32 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl text-slate-900 leading-tight mb-8">
                {is72t ? 'Ultimate capacity and luxury, built without compromise' : is45t ? 'Enhanced space and capability, built without compromise' : 'Perfect balance and performance, built without compromise'}
              </h2>
              <div className="mb-10 flex flex-col gap-[3px]">
                <span className="block h-px w-28 bg-brass" />
                <span className="block h-px w-16 bg-brass/50" />
              </div>
              {content.longDescription.map((paragraph, index) => (
                <p key={index} className="text-lg text-slate-600 mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
              <div className="space-y-4 mt-8">
                {(content.highlights ?? content.features.slice(0, 4)).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="relative image-premium">
                <Image
                  src={content.gallery[1] ? `/models/${params.slug}/${content.gallery[1]}` : content.heroImage}
                  alt={`${modelName} interior view`}
                  width={600}
                  height={400}
                  className="shadow-2xl"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      {/* The build plate: the riveted panel a coachbuilder fixes inside the
          body, carrying the numbers that actually govern what the vehicle
          can do. One object with a brass edge, not three floating cards —
          and three arbitrary glyphs removed, since "Dimensions" needs no
          lorry icon to explain it. */}
      <section id="specifications" className="py-20 md:py-32 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl text-white leading-[1.1]">
              {modelName} Technical Details
            </h2>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Every {modelName} is built to the highest standards with premium components throughout.
            </p>
          </div>

          <div className="mt-14 border border-brass/35">
            <div className="grid md:grid-cols-3">
              <div className="p-8 border-b border-brass/20 md:border-b-0 md:border-r">
                <h3 className="text-sm font-medium tracking-wide text-brass-light">Dimensions</h3>
                <dl className="mt-6">
                  {Object.entries(content.specifications.dimensions).map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-6 border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                      <dt className="text-white/60">{key}</dt>
                      <dd className="text-right tabular-nums text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="p-8 border-b border-brass/20 md:border-b-0 md:border-r">
                <h3 className="text-sm font-medium tracking-wide text-brass-light">Weights &amp; Capacity</h3>
                <dl className="mt-6">
                  {Object.entries(content.specifications.weights).map(([key, value]) => (
                    <div key={key} className="flex items-baseline justify-between gap-6 border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                      <dt className="text-white/60">{key}</dt>
                      <dd className="text-right tabular-nums text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="p-8">
                <h3 className="text-sm font-medium tracking-wide text-brass-light">Safety Features</h3>
                <ul className="mt-6">
                  {content.specifications.safety.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                      <Check className="mt-1 w-4 h-4 shrink-0 text-brass-light" strokeWidth={1.5} />
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-ink mb-6 leading-[1.1]">
              Key Features & Options
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every {modelName} comes with essential features as standard, with extensive customization options available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-start p-4 bg-white border border-slate-200 hover:border-blue-400 transition-colors">
                <Check className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 md:py-32 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-ink mb-6 leading-[1.1]">
              Gallery
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore the {modelName} in detail
            </p>
          </div>

          <LightboxGallery
            images={content.gallery.map((image, index) => ({
              src: `/models/${params.slug}/${image}`,
              alt: `${modelName} view ${index + 1}`,
            }))}
          />
        </div>
      </section>

      {/* Testimonial Section */}
      {content.testimonial && (
        <section className="py-20 md:py-32 bg-ink">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="font-display text-2xl md:text-3xl text-white mb-8 italic leading-[1.1]">
              "{content.testimonial.quote}"
            </blockquote>
            <div>
              <p className="text-xl text-white font-semibold">{content.testimonial.name}</p>
              <p className="text-blue-400">{content.testimonial.role}</p>
            </div>
          </div>
        </section>
      )}

      {/* Comprehensive FAQ Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-6 leading-[1.1]">
              Everything You Need to Know About the {modelName}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Common questions about specifications, pricing, and customization options
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What makes the {modelName} different from other {modelCategory.toLowerCase()} horseboxes?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {content.longDescription[0]}
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  How many horses can the {modelName} carry?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  The {modelName} can safely transport {content.specifications.weights['Horse Capacity']}.{' '}
                  The horse area is {content.specifications.dimensions['Horse Area'] || content.specifications.dimensions['Horse Area Length'] || content.specifications.dimensions['Stallion Area'] || 'spacious'},
                  with a gross weight of {content.specifications.weights['Gross Weight']}
                  {payload && ` and a payload of ${payload.charAt(0).toLowerCase()}${payload.slice(1)}`}.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What&apos;s included as standard in the {modelName}?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Standard features include: {content.features.slice(0, 5).join(', ')}.{' '}
                  The {modelName} comes with our {warrantyPhrase} warranty and comprehensive handover training.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Can I view the {modelName} before purchasing?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  You&apos;re welcome to visit our Norfolk workshop. We can&apos;t guarantee to have a {modelName} in
                  when you visit, but there will always be horseboxes to view. We&apos;re open Monday to Friday, 9am-5pm,
                  and weekends by appointment only. Call 01603 552109 to arrange your visit.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What finance options are available?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  We work with excellent finance providers and can provide referrals on request.
                </p>
              </div>
              
              <div className="bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  How long does delivery take?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Build time for the {modelName} is typically 8-12 weeks from order confirmation, depending on 
                  specification and customization requirements. We deliver throughout the UK and Ireland with 
                  full handover training included.
                </p>
              </div>
            </div>
          </div>

          {/* Additional buying guide content */}
          <div className="bg-paper p-8 md:p-12">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
              Why Choose JTH for Your {modelCategory} Horsebox?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">British Manufacturing Excellence</h4>
                <p className="text-slate-600">
                  Every {modelName} is built in our Norfolk workshop by skilled craftsmen with decades of experience. 
                  We use only premium materials and components, ensuring your horsebox will provide years of reliable service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Comprehensive Support</h4>
                <p className="text-slate-600">
                  From initial consultation through to aftercare, we&apos;re with you every step of the way.{' '}
                  {warrantyMonths >= 24
                    ? 'Our 2-year warranty is twice the industry standard, and our service team is always available to help.'
                    : `The ${modelName} comes with a ${warrantyPhrase} warranty, and our service team is always available to help.`}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Proven Track Record</h4>
                <p className="text-slate-600">
                  Incorporating the heritage of KPH Horseboxes and built in our Norfolk workshop,
                  JTH is a name you can trust for quality, reliability, and durability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-8 leading-[1.1]">
            Ready to Experience the {modelName}?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Contact our team for a personalised quote and consultation
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/contact" className="btn-on-dark">
              Get a Quote
            </Link>
            <a href="tel:01603552109" className="btn-on-dark-outline">
              <Phone className="mr-2 w-5 h-5" />
              Call 01603 552109
            </a>
          </div>

          <div className="mt-16 pt-16 border-t border-blue-500">
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="text-white font-semibold mb-4">Visit Our Workshop</h3>
                <p className="text-blue-100">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  J Taylor Horseboxes<br />
                  Norfolk<br />
                  United Kingdom
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                <p className="text-blue-100">
                  <Phone className="inline w-4 h-4 mr-2" />
                  01603 552109<br />
                  <Mail className="inline w-4 h-4 mr-2" />
                  sales@jthltd.co.uk
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Opening Hours</h3>
                <p className="text-blue-100">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Monday - Friday: 9am - 5pm<br />
                  Saturday & Sunday: By appointment only
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}