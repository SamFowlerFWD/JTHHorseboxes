#!/usr/bin/env node

/**
 * Direct Blog Posts Migration Script
 * Inserts blog posts directly using the Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Blog posts data
const blogPosts = [
  {
    title: 'Horsebox Payloads: Understanding Weight Limits and Legal Requirements',
    slug: 'horsebox-payloads',
    excerpt: 'A comprehensive guide to understanding horsebox payload fundamentals, weight calculations, and legal compliance for safe horse transportation.',
    content: `<h2>Understanding Horsebox Payloads</h2>
<p>For prospective horsebox buyers, understanding payload is crucial. Payload represents <strong>the amount of load you can legally add to the empty horsebox without exceeding</strong> the maximum authorized mass.</p>

<h3>Technical Definitions</h3>
<ul>
  <li><strong>Unladen Weight:</strong> The vehicle mass without passengers or cargo</li>
  <li><strong>MAM (Maximum Authorised Mass):</strong> Total permissible weight including load</li>
  <li><strong>Payload:</strong> Calculated by subtracting unladen weight from MAM</li>
</ul>

<h3>Weight Calculation Guidance</h3>
<p>When planning your loads, use these approximate weights for common items:</p>
<ul>
  <li>Average horse: 542 kg (range: 430-710 kg)</li>
  <li>Fuel: approximately 1 kg per liter</li>
  <li>Water: approximately 1 kg per liter</li>
  <li>Saddles: approximately 10 kg each</li>
  <li>Hay bales: approximately 25 kg each</li>
</ul>

<h3>Critical Warnings</h3>
<p>Be cautious when accepting manufacturer claims about payload. Some sellers remove heavy components to artificially inflate payload figures shown on weight certificates. Always verify the actual configuration matches what you're purchasing.</p>

<h3>Axle Loading and Weight Distribution</h3>
<p>Proper horse positioning is critical for safe operation. Horses should be positioned over the rear axles to maintain correct weight distribution across the vehicle. Manufacturer design must account for proper weight distribution to prevent axle overload violations.</p>

<h3>Real-World Example</h3>
<p>In one case, repositioning a large horse from the front stall to the middle stall prevented front axle overload violations, demonstrating how critical proper weight distribution is to legal and safe operation.</p>

<p><em>Written by Kevin Parker, formerly of KPH. Content acquired by J Taylor Horseboxes Ltd in 2025.</em></p>`,
    category: 'Buying Guide',
    tags: ['payload', 'weight', 'safety', 'compliance', 'legal requirements'],
    meta_title: 'Horsebox Payloads: Weight Limits & Legal Requirements | JTH',
    meta_description: 'Expert guide to horsebox payload calculations, weight limits, and legal compliance. Learn how to properly calculate payload and avoid overloading.',
    keywords: ['horsebox payload', 'weight limits', 'MAM', 'axle loading', 'horsebox weight'],
    featured: false,
    featured_image: '/blog/horsebox-payloads.jpg',
    status: 'published',
    published_at: '2025-02-07T10:00:00Z'
  },
  {
    title: 'Horsebox Ventilation: Maintaining Proper Airflow and Temperature Control',
    slug: 'horsebox-ventilation',
    excerpt: 'Comprehensive guide to maintaining proper airflow and temperature control when transporting horses, with expert testing insights.',
    content: `<h2>The Importance of Proper Ventilation</h2>
<p>Maintaining proper airflow and temperature control is essential for safe horse transportation. Through extensive testing using smoke generators and temperature recording equipment, we've developed proven ventilation strategies.</p>

<h3>Temperature Monitoring</h3>
<p>Installing temperature probes with cab readouts is <strong>a very sensible addition to any horsebox</strong>, enabling drivers to monitor conditions without guesswork. This allows you to make informed decisions about ventilation adjustments during travel.</p>

<h3>Paint Color Impact on Temperature</h3>
<p>Research has demonstrated that <strong>white or light-coloured surfaces, especially on roofs, are far better at reflecting sunlight away</strong>, significantly reducing heat buildup compared to dark colors. This simple choice can make a substantial difference in maintaining comfortable temperatures.</p>

<h3>The Significance of Headroom</h3>
<p>Testing revealed dramatic temperature differences based on ceiling height. A mere 20-centimeter increase in headroom produced approximately <strong>7°C temperature reduction</strong> around the horse's head—a critical finding for horse comfort and safety.</p>

<h3>Effective Window Design</h3>
<p>Proper ventilation requires <strong>one large horse window for each horse's head and smaller higher windows at the tail</strong>, creating pressure differentials that draw fresh air across the animals as the vehicle moves.</p>

<h3>Ventilation Methods</h3>
<p>Multiple approaches can be combined for optimal results:</p>
<ul>
  <li><strong>Tilted roof vents:</strong> Effective for moving vehicles, creating natural airflow</li>
  <li><strong>Extraction fans:</strong> Essential for stationary conditions</li>
  <li><strong>Wall fans:</strong> Provide supplemental cooling when needed</li>
  <li><strong>Air conditioning:</strong> Offers maximum control but at higher cost</li>
</ul>

<h3>Understanding "Lazy Air"</h3>
<p>Air naturally follows paths of least resistance, a concept we call "lazy air." This requires strategic window management to ensure comprehensive circulation throughout the horse area, preventing hot spots and stagnant air pockets.</p>

<p><em>Written by Kevin Parker, formerly of KPH.</em></p>`,
    category: 'Safety',
    tags: ['ventilation', 'temperature', 'horse welfare', 'airflow'],
    meta_title: 'Horsebox Ventilation: Temperature Control & Airflow | JTH',
    meta_description: 'Expert guide to horsebox ventilation with temperature monitoring, window design, and proven cooling strategies for safe horse transport.',
    keywords: ['horsebox ventilation', 'temperature control', 'horse transport safety', 'airflow'],
    featured: true,
    featured_image: '/blog/horsebox-ventilation.jpg',
    status: 'published',
    published_at: '2025-02-07T11:00:00Z'
  },
  {
    title: 'Horsebox Aluminium: Advantages, Limitations, and Best Practices',
    slug: 'horsebox-aluminium',
    excerpt: 'Expert analysis of aluminium in horsebox manufacturing, including advantages, critical limitations, and real-world case studies.',
    content: `<h2>The Truth About Aluminium in Horsebox Construction</h2>
<p>Aluminium has become increasingly popular in horsebox manufacturing, but it's important to understand both its advantages and limitations. As an industry expert, I want to provide an honest assessment based on real-world experience.</p>

<h3>Aluminium's Advantages</h3>
<ul>
  <li><strong>Lightweight material:</strong> Approximately one-third the density of steel</li>
  <li><strong>Proven track record:</strong> Successfully used by major vehicle manufacturers</li>
  <li><strong>Effective applications:</strong> Excellent for external bodywork, doors, and cappings</li>
</ul>

<h3>Critical Limitations</h3>
<p>It's essential to understand that <strong>aluminium is not a cure-all product for the manufacture of lightweight horseboxes</strong>. Major concerns include:</p>

<ul>
  <li><strong>Metal compatibility:</strong> Incompatibility with other metals causes accelerated galvanic corrosion</li>
  <li><strong>Structural requirements:</strong> Requires larger structural sections (up to 40% larger than steel equivalents)</li>
  <li><strong>Engineering demands:</strong> Demands extensive knowledge for proper structural use</li>
  <li><strong>Marketing claims:</strong> Often marketed with durability claims unsupported by evidence</li>
</ul>

<h3>Real-World Case Study: Failed Aluminium Ramp</h3>
<p>A detailed examination of a failed aluminium ramp demonstrated multiple issues:</p>
<ul>
  <li>Cracked joints from flexing due to insufficient structural design</li>
  <li>Galvanic corrosion around steel hinges and mounting points</li>
  <li>Poor paint preparation and inadequate sealing</li>
  <li>Corroded aluminium plank floors with incompatible zinc rivets</li>
</ul>

<h3>Best Practice Recommendations</h3>
<p>Proper aluminium use requires:</p>
<ul>
  <li>Barriers between dissimilar metals to prevent galvanic corrosion</li>
  <li>Designs that account for material flexing characteristics</li>
  <li>Rigorous quality control throughout manufacturing</li>
  <li>Proper surface preparation and protective coatings</li>
</ul>

<p>These factors are often overlooked by manufacturers prioritizing cost reduction over long-term durability.</p>

<p><em>Written by Kevin Parker, formerly of KPH, now with J Taylor Horseboxes Ltd.</em></p>`,
    category: 'Features',
    tags: ['aluminium', 'materials', 'construction', 'durability'],
    meta_title: 'Horsebox Aluminium: Pros, Cons & Best Practices | JTH',
    meta_description: 'Honest expert analysis of aluminium in horsebox construction, covering advantages, limitations, and real-world case studies.',
    keywords: ['horsebox aluminium', 'aluminium construction', 'materials', 'corrosion'],
    featured: false,
    featured_image: '/blog/horsebox-aluminium.jpg',
    status: 'published',
    published_at: '2025-02-07T12:00:00Z'
  },
  {
    title: 'Horsebox Passenger Seatbelts: Legal Requirements and Installation',
    slug: 'horsebox-passenger-seatbelts',
    excerpt: 'Essential guide to passenger seatbelts in horseboxes, covering UK/EU legal requirements, installation limitations, and seating configurations.',
    content: `<h2>Understanding Horsebox Passenger Seatbelt Requirements</h2>
<p>Passenger safety is paramount in horsebox design and operation. This guide addresses common questions about seatbelts under current UK/EU legislation.</p>

<h3>Installation Limitations</h3>
<p>Aftermarket seatbelt additions to existing horsebox seating are not legal. According to regulations, <strong>the full seat, including belts, mounting frame, anchor points and bolts all need certification</strong>.</p>

<p>Retrofitting used horseboxes requires complete seating replacement and system relocation—an expensive undertaking that often isn't economically viable.</p>

<h3>Seating Configuration Rules</h3>
<ul>
  <li>Seats must face forward or backward, <strong>never sideways</strong></li>
  <li>Single cab seats can be upgraded to double passenger seats for legal three-person capacity</li>
  <li>Additional seating rows behind the cab compromise payload and rear axle loading</li>
</ul>

<h3>Legal Requirements Under EU Directive 2005/40/EC</h3>
<p>The directive mandates seatbelts on all seats (except stationary-use-only seats) in vehicles manufactured after <strong>October 20, 2007</strong>.</p>

<p>Key points:</p>
<ul>
  <li>Children under three cannot travel in horseboxes without proper restraints</li>
  <li>Passenger numbers cannot exceed available seatbelts</li>
  <li>All seatbelts must be properly certified and installed</li>
</ul>

<h3>Options for New Horseboxes</h3>
<p>Custom seating with certified seatbelts is available for new builds, but this option remains costly and payload-dependent. When ordering a new horsebox, discuss seating requirements early in the design process to ensure proper integration.</p>

<h3>Safety First</h3>
<p>While adding passenger capacity may be desirable, never compromise on safety or legal compliance. Properly certified seating systems protect your passengers and ensure you're operating within the law.</p>

<p><em>For questions about seating options in new JTH horseboxes, contact us at 01603 552109 or sales@jthltd.co.uk</em></p>`,
    category: 'Safety',
    tags: ['seatbelts', 'passengers', 'legal compliance', 'safety'],
    meta_title: 'Horsebox Passenger Seatbelts: Legal Guide | JTH',
    meta_description: 'Complete guide to horsebox passenger seatbelts, UK/EU legal requirements, installation rules, and seating configurations.',
    keywords: ['horsebox seatbelts', 'passenger safety', 'legal requirements', 'EU directive'],
    featured: false,
    featured_image: '/blog/horsebox-seatbelts.jpg',
    status: 'published',
    published_at: '2025-02-07T13:00:00Z'
  },
  {
    title: 'Horsebox Safety Checks: Pre-Trip Preparation Essentials',
    slug: 'horsebox-safety-checks',
    excerpt: 'Comprehensive pre-trip safety checklist for horsebox owners, covering documentation, payload, tires, flooring, and essential maintenance.',
    content: `<h2>Essential Pre-Trip Safety Checks</h2>
<p>Proper pre-trip preparation goes far beyond basic cleaning and loading. This comprehensive guide addresses the essential safety and maintenance checks every horsebox owner should perform before hitting the road.</p>

<h3>Documentation & Legal Requirements</h3>
<p>Before any journey, verify that these documents are current:</p>
<ul>
  <li>Insurance coverage (including horsebox and passenger liability)</li>
  <li>Road tax (vehicle excise duty)</li>
  <li>MOT certification (if applicable)</li>
</ul>

<h3>Payload Management</h3>
<p>Critical safety point: <strong>Everything you have loaded for the outing must fall within the payload allowance</strong> to maintain insurance validity and road safety. This includes horses, passengers, equipment, water, fuel, and supplies.</p>

<h3>Tire Inspection</h3>
<p>Comprehensive tire checks should include:</p>
<ul>
  <li><strong>Pressure:</strong> Check when cold, according to manufacturer specifications</li>
  <li><strong>Tread depth:</strong> Minimum legal requirement is 1.6mm across central three-quarters</li>
  <li><strong>Condition:</strong> Look for cuts, bulges, and irregular wear patterns</li>
  <li><strong>Age:</strong> Note that <strong>tyres aged 10 years and older are banned</strong> from certain vehicle types</li>
  <li><strong>Inner walls:</strong> Inspect for damage not visible from outside</li>
</ul>

<h3>Horse Flooring & Safety Surfaces</h3>
<p>Regular visual inspections should identify:</p>
<ul>
  <li>Rot or deterioration in wooden components</li>
  <li>Cracks in flooring panels</li>
  <li>Rust on metal support structures</li>
  <li>Water damage or staining</li>
</ul>

<p><strong>Horses place considerable weight on a relatively small area</strong>, requiring vigilant monitoring of floor condition.</p>

<h3>Ramp Maintenance</h3>
<p>Check these critical ramp components:</p>
<ul>
  <li>Hinges for rust and proper operation</li>
  <li>Springs for tension and integrity</li>
  <li>Hydraulic components for leaks and smooth operation</li>
  <li>Surface grip and anti-slip coating</li>
</ul>

<h3>Ventilation System Optimization</h3>
<p>Ensure all ventilation components are functional:</p>
<ul>
  <li>Windows open and close smoothly</li>
  <li>Roof vents operate correctly</li>
  <li>Fans (if equipped) work properly</li>
  <li>No blockages in air paths</li>
</ul>

<h3>Water Quality and Systems</h3>
<p><strong>Water can start to go stale after about two weeks</strong> without proper tank maintenance. Regular tank flushing and refilling ensures fresh water availability.</p>

<h3>Additional Essential Checks</h3>
<ul>
  <li><strong>Gas safety:</strong> Current certification and leak checks</li>
  <li><strong>Lighting systems:</strong> All exterior and interior lights functional</li>
  <li><strong>Emergency kit:</strong> First aid, fire extinguisher, warning triangle</li>
  <li><strong>Feed supplies:</strong> Adequate hay and feed for journey duration</li>
</ul>

<p><em>Written by Kevin Parker, formerly of KPH, now with J Taylor Horseboxes Ltd.</em></p>`,
    category: 'Maintenance',
    tags: ['safety', 'maintenance', 'pre-trip checks', 'inspection'],
    meta_title: 'Horsebox Safety Checks: Pre-Trip Essentials | JTH',
    meta_description: 'Essential pre-trip safety checklist covering documentation, payload, tires, flooring, and critical maintenance for horsebox owners.',
    keywords: ['horsebox safety', 'pre-trip checks', 'maintenance', 'inspection'],
    featured: false,
    featured_image: '/blog/horsebox-safety-checks.jpg',
    status: 'published',
    published_at: '2025-02-07T14:00:00Z'
  },
  {
    title: "Before You Buy A Horsebox: Essential Buyer's Guide",
    slug: 'before-you-buy-a-horsebox',
    excerpt: "Comprehensive buyer's guide covering licensing requirements, payload calculations, quality assessment, and manufacturer transparency.",
    content: `<h2>Critical Considerations Before Purchasing a Horsebox</h2>
<p>It's alarming how many horsebox buyers encounter unsettling tales, ranging from poor customer service to hazardous manufacturing practices. This guide will help you make an informed decision and avoid common pitfalls.</p>

<h3>Licensing & Size Requirements</h3>
<p>Your driving credentials determine vehicle eligibility. Weight categories range from 3.5 to 26 tonnes, with corresponding license requirements:</p>
<ul>
  <li><strong>3.5 tonne:</strong> Standard car license (Category B) in most cases</li>
  <li><strong>4.5-7.5 tonne:</strong> May require C1 category (check your license)</li>
  <li><strong>7.5+ tonne:</strong> Requires HGV license</li>
</ul>

<p>Verify your license entitlements before committing to a purchase.</p>

<h3>Understanding Payload Calculations</h3>
<p>Payload represents the total transportable weight including horses, people, and equipment. The calculation is simple:</p>

<p><strong>Payload = Maximum Authorised Mass (MAM) - Unladen Weight</strong></p>

<p>Overweight vehicles compromise:</p>
<ul>
  <li>Cornering stability</li>
  <li>Braking performance</li>
  <li>Insurance validity</li>
  <li>Legal compliance</li>
</ul>

<h3>Quality Assessment Checklist</h3>
<p>When inspecting a horsebox (new or used), examine:</p>

<h4>Undercarriage & Structure</h4>
<ul>
  <li>Undercarriage finish and corrosion protection</li>
  <li>Floor integrity and condition</li>
  <li>Weld quality and consistency</li>
  <li>Chassis condition</li>
</ul>

<h4>Mechanical Systems</h4>
<ul>
  <li>Tire condition, tread depth, and age</li>
  <li>Clutch operation (no slipping)</li>
  <li>Brake performance and feel</li>
  <li>Gearbox smoothness</li>
</ul>

<h4>Horse Area & Utilities</h4>
<ul>
  <li>Water system integrity and taste</li>
  <li>Electrical components and wiring</li>
  <li>Ramp functionality and safety features</li>
  <li>Partition strength and operation</li>
  <li>Ventilation adequacy</li>
</ul>

<h3>Manufacturer Transparency</h3>
<p>Reputable manufacturers welcome scrutiny. Request:</p>
<ul>
  <li><strong>Factory tours:</strong> See the production process firsthand</li>
  <li><strong>Production photographs:</strong> Document build quality</li>
  <li><strong>Weighbridge certificates:</strong> Verify actual unladen weight on-site</li>
  <li><strong>Customer references:</strong> Speak with previous buyers</li>
</ul>

<p>Be cautious of companies unwilling to demonstrate their manufacturing processes or provide transparent information.</p>

<h3>Research Before Committing</h3>
<p>Investigate thoroughly before purchasing:</p>
<ul>
  <li>Read forum discussions and owner reviews</li>
  <li>Join horsebox owner groups on social media</li>
  <li>Attend shows to compare models in person</li>
  <li>Request detailed specifications in writing</li>
</ul>

<h3>Final Advice</h3>
<p><strong>Avoid compromising on your requirements.</strong> Dissatisfaction typically leads to premature replacement, costing far more in the long run. Take your time, do your research, and choose a horsebox that truly meets your needs.</p>

<p><em>Written by Kevin Parker, formerly of KPH, now with J Taylor Horseboxes Ltd.</em></p>`,
    category: 'Buying Guide',
    tags: ['buying guide', 'inspection', 'quality', 'manufacturer transparency'],
    meta_title: "Before You Buy A Horsebox: Complete Buyer's Guide | JTH",
    meta_description: "Essential horsebox buyer's guide covering licensing, payload, quality inspection, and manufacturer transparency. Make an informed purchase.",
    keywords: ['horsebox buying guide', 'horsebox inspection', 'buying checklist', 'horsebox quality'],
    featured: true,
    featured_image: '/blog/before-you-buy-horsebox.jpg',
    status: 'published',
    published_at: '2025-02-07T15:00:00Z'
  },
  {
    title: 'Horsebox Air Brakes: Understanding Air Brake Systems',
    slug: 'horsebox-air-brakes',
    excerpt: 'Comprehensive guide to air brake systems for horsebox operators, covering history, operation, safety features, and MOT testing.',
    content: `<h2>Understanding Air Brake Systems in Horseboxes</h2>
<p>For operators transitioning to larger vehicles, air brake systems can seem complex. This guide demystifies air brakes and explains their operation and advantages.</p>

<h3>Historical Context</h3>
<p>George Westinghouse patented the first air brake on <strong>March 5, 1872</strong>, for railway use. The technology's proven safety advantages led to its transfer to truck manufacturing in the early 20th century, where it remains the standard for heavy vehicles.</p>

<h3>Basic Operation from the Driver's Perspective</h3>
<p>From the driver's seat, air brakes function similarly to conventional car brakes:</p>
<ul>
  <li>Foot pedal for service braking</li>
  <li>Hand control for parking brake</li>
  <li>Air tank pressure gauges on dashboard</li>
  <li>Warning indicators for low pressure</li>
</ul>

<p>The key difference: <strong>The vehicle cannot move until air pressure builds sufficiently</strong> after engine start, typically 30-60 seconds.</p>

<h3>Primary Safety Advantage</h3>
<p>The most significant benefit of air brakes is fail-safe operation: <strong>In the event of a failure or fault in the brake system, rather than a runaway vehicle, any loss of air will automatically engage the brakes and safely stop the vehicle.</strong></p>

<p>This contrasts sharply with hydraulic systems, where fluid loss can result in complete brake failure.</p>

<h3>Load Sensing Valves</h3>
<p>This separate safety system automatically adjusts braking pressure distribution between front and rear wheels based on vehicle weight. Benefits include:</p>
<ul>
  <li>Prevents rear-wheel lockup when lightly loaded</li>
  <li>Ensures adequate rear braking when fully loaded</li>
  <li>Improves stability during emergency braking</li>
  <li>Reduces tire wear</li>
</ul>

<h3>Anti-Lock Brake Systems (ABS)</h3>
<p>Modern horseboxes include ABS systems that:</p>
<ul>
  <li>Continuously monitor wheel rotation</li>
  <li>Detect locked wheels within milliseconds</li>
  <li>Remove and reapply braking pressure multiple times per second</li>
  <li>Maintain steering control during emergency braking</li>
</ul>

<h3>MOT Testing Important Tip</h3>
<p>For accurate MOT brake testing, <strong>vehicles should carry load in the horse area</strong> during testing. This ensures the load sensing valve distributes proper pressure to rear brakes, preventing false failures due to light rear-axle loading.</p>

<h3>Maintenance Considerations</h3>
<p>Air brake systems require:</p>
<ul>
  <li>Regular air tank drainage to remove moisture</li>
  <li>Periodic inspection of air lines and connections</li>
  <li>Brake adjustment checks (though many modern systems self-adjust)</li>
  <li>Annual MOT testing by qualified technicians</li>
</ul>

<h3>Transition Advice</h3>
<p>If you're new to air brakes, consider:</p>
<ul>
  <li>Taking a familiarization session with an experienced operator</li>
  <li>Practicing in a safe area before loaded travel</li>
  <li>Understanding the startup procedure and pressure gauges</li>
  <li>Learning to recognize warning sounds and indicators</li>
</ul>

<p><em>Written by Kevin Parker, formerly of KPH.</em></p>`,
    category: 'Features',
    tags: ['air brakes', 'safety', 'braking systems', 'heavy vehicles'],
    meta_title: 'Horsebox Air Brakes: Complete Guide to Air Brake Systems | JTH',
    meta_description: 'Expert guide to air brake systems in horseboxes, covering operation, safety features, load sensing, and MOT testing tips.',
    keywords: ['horsebox air brakes', 'air brake systems', 'ABS', 'load sensing valve'],
    featured: false,
    featured_image: '/blog/horsebox-air-brakes.jpg',
    status: 'published',
    published_at: '2025-02-07T16:00:00Z'
  }
];

async function checkBlogPostsTable() {
  console.log('\n📊 Checking blog_posts table status...\n');

  try {
    const { count, error } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "public.blog_posts" does not exist')) {
        console.log('❌ blog_posts table does not exist');
        return { exists: false, count: 0 };
      }
      console.log('⚠️  Error checking blog posts:', error.message);
      return { exists: true, count: 0, error };
    }

    console.log(`✅ blog_posts table exists with ${count || 0} records`);
    return { exists: true, count: count || 0 };

  } catch (err) {
    console.log('❌ Error checking blog_posts table:', err.message);
    return { exists: false, count: 0, error: err };
  }
}

async function insertBlogPosts() {
  console.log('\n🚀 Inserting blog posts directly...\n');

  const results = [];

  for (const post of blogPosts) {
    try {
      console.log(`📝 Inserting: ${post.title}`);

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select('id, title, slug')
        .single();

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({ title: post.title, success: false, error: error.message });
      } else {
        console.log(`   ✅ Success! ID: ${data.id}`);
        results.push({ title: post.title, success: true, id: data.id });
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      results.push({ title: post.title, success: false, error: err.message });
    }
  }

  return results;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying blog posts...\n');

  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category, status, published_at')
      .order('published_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching blog posts:', error.message);
      return false;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️  No blog posts found');
      return false;
    }

    console.log(`✅ Found ${posts.length} blog posts:\n`);

    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Status: ${post.status}`);
      console.log('');
    });

    // Check categories
    const categories = {};
    posts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });

    console.log('📊 Posts by category:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} posts`);
    });

    return true;

  } catch (err) {
    console.error('❌ Error verifying migration:', err.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('   J TAYLOR HORSEBOXES - BLOG POSTS MIGRATION (DIRECT)');
  console.log('='.repeat(60));

  // Check current status
  const initialStatus = await checkBlogPostsTable();

  if (initialStatus.exists && initialStatus.count > 0) {
    console.log('\n⚠️  Blog posts already exist in the database');
    console.log(`   Current count: ${initialStatus.count} posts`);

    await verifyMigration();

    console.log('\n💡 To re-apply the migration:');
    console.log('   1. Delete existing posts first via SQL Editor');
    console.log('   2. Run this script again');

  } else if (!initialStatus.exists) {
    console.log('\n❌ The blog_posts table does not exist!');
    console.log('\n📋 Please create the table first by running:');
    console.log('   1. The main migration that creates all tables');
    console.log('   2. Or create the blog_posts table separately');
    console.log('\nThen run this script again to insert the blog posts.');

  } else {
    // Table exists but is empty, insert the posts
    console.log('\n📝 Blog posts table is empty, inserting posts...');

    const results = await insertBlogPosts();

    // Count successes
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(60));
    console.log(`   MIGRATION RESULTS: ${successful} succeeded, ${failed} failed`);
    console.log('='.repeat(60));

    if (successful > 0) {
      await verifyMigration();

      if (failed === 0) {
        console.log('\n🎉 All blog posts migrated successfully!');
      } else {
        console.log('\n⚠️  Partial success - some posts failed to insert');
        console.log('Failed posts:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`  - ${r.title}: ${r.error}`);
        });
      }
    } else {
      console.log('\n❌ Migration failed - no posts were inserted');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('   Migration process complete');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);