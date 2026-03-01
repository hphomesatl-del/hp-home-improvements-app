import React, { useState } from 'react';
import '../styles/Vendors.css';

const VENDORS_BY_CATEGORY = {
  'Paint & Finishes': [
    { name: 'Sherwin Williams', contact: 'Counter Sales', phone: 'Visit nearest location', website: 'sherwin-williams.com', note: 'Premium interior & exterior paint', storeLocator: 'https://www.sherwin-williams.com/storelocator', resources: [{ label: 'Paint Color Visualizer', url: 'https://www.sherwin-williams.com/homeowners/color' }, { label: 'Store Locator', url: 'https://www.sherwin-williams.com/storelocator' }] }
  ],
  'Tile & Flooring': [
    { name: 'Floor and Decor', contact: 'Counter Sales', phone: 'Visit showroom', address: '1690 Northeast Expy NE, Atlanta, GA 30329', website: 'flooranddecor.com', note: 'Floor and Decor Mall of Georgia - I85 Frontage Rd', storeLocator: 'https://www.flooranddecor.com/stores' },
    { name: 'ProSource', subtitle: 'Flooring/Tile Wholesale', contact: 'John Timper', address: '3000 Miller Court West, Norcross, GA 30071', phone: 'Call for pricing', website: 'prosourcewholesale.com', storeLocator: 'https://www.prosource.com/locator' },
    { name: 'Specialty Tile Products, Inc.', contact: 'Denise Taylor | Showroom Sales', address: '721 Miami Circle, Suite 107, Atlanta, GA 30324', phone: '404-941-1777 (Direct) / 404-264-0727 (Office)', website: 'SpecialtyTile.com', storeLocator: 'https://www.specialtytile.com/contact' }
  ],
  'Plumbing Fixtures': [
    { name: 'PDI - Roswell', subtitle: 'Master Bath Plumbing Fixtures', contact: 'Shelby Swann', address: '1021 Mansell Road, Roswell, GA 30076', phone: '678-781-9240', email: 'sswann@plumbingdistributors.com', storeLocator: 'https://www.pdiproducts.com/locations' },
    { name: 'PDI - Lawrenceville', subtitle: 'Plumbing / Lighting Fixtures', contact: 'Tawney Patterson', address: '1025 Old Norcross Rd, Lawrenceville, GA 30046-1166', phone: '678-326-1825', email: 'TPatterson@relyonpdi.co', storeLocator: 'https://www.pdiproducts.com/locations' },
    { name: 'eFaucets.com', contact: 'Counter Sales', phone: 'Online ordering', website: 'Efaucets.com', note: 'Plumbing Fixtures Online', storeLocator: 'https://www.efaucets.com' },
    { name: 'Lowes', contact: 'Counter Sales', phone: 'Visit nearest location', note: 'Plumbing fixtures & supplies', storeLocator: 'https://www.lowes.com/store-locator' },
    { name: 'Home Depot', contact: 'Counter Sales', phone: 'Visit nearest location', note: 'Plumbing fixtures & supplies', storeLocator: 'https://www.homedepot.com/storefinder' }
  ],
  'Lighting': [
    { name: 'Progressive Lighting', contact: 'Counter Sales', phone: 'Online ordering', website: 'progresslighting.com', note: 'Lighting fixtures & design', storeLocator: 'https://www.progresslighting.com' },
    { name: 'Georgia Lighting', contact: 'Frank / Linda', address: '120 Peachtree Industrial Blvd, Sugar Hill, GA 30518', phone: 'Call for information', note: 'Lighting solutions', storeLocator: 'https://www.georgia-lighting.com' }
  ],
  'Cabinets': [
    { name: 'Wheeler Woodworks', subtitle: 'Elite Grade Cabinets', contact: 'Donna Wheeler', address: 'Suwanee, GA', phone: '770-307-1684', website: 'wheelerwoodworks.net', storeLocator: 'http://www.wheelerwoodworks.net/main.html' },
    { name: 'Suwanee Decorative Hardware Inc.', contact: 'Showroom Sales', address: '1810 Peachtree Industrial Blvd STE 115, Duluth, GA 30097', phone: '770-623-1530 (Showroom) / 770-623-1540 (Sales) / 866-366-4066 (Toll Free)', website: 'DoorHardwareUSA.com', storeLocator: 'https://www.doorhardwareusa.com/contact-us' },
    { name: 'Budget Cabinets', contact: 'Counter Sales', phone: 'Call for quote', website: 'jk2kitchenbath.com', note: '12 different cabinet styles', storeLocator: 'http://jk2kitchenbath.com' }
  ],
  'Vanities': [
    { name: 'Hardware Resources', contact: 'Counter Sales', phone: 'Online ordering', website: 'Hardwareresources.com', note: 'Vanities and mirrors', storeLocator: 'https://www.hardwareresources.com' },
    { name: 'Wayfair', contact: 'Counter Sales', phone: 'Online ordering', website: 'wayfair.com', note: 'Bathroom vanities & fixtures', storeLocator: 'https://www.wayfair.com' }
  ],
  'Stone & Slabs': [
    { name: 'The Levantina Atlanta Showroom', contact: 'Showroom Sales', address: '2499 Newpoint Parkway Suite #300, Lawrenceville, GA 30043', phone: '678-436-5439', email: 'atlantasales@levantinausa.com', hours: 'Mon-Fri 8AM-5PM, Sat 10AM-2PM', storeLocator: 'https://www.levantinausa.com/locations' },
    { name: 'Stone Showcase', contact: 'Showroom Sales', address: '1785 Enterprise Dr Suite B, Buford, GA 30518', phone: '678-546-6166', fax: '678-546-1445', hours: 'Mon-Fri 9am-5pm, Sat 10am-1pm', storeLocator: 'https://www.stoneshowcase.com' },
    { name: 'Georgian Stone Corp', contact: 'Jim (Stone Solutions Rep)', address: '3045 Business Park Drive Suite A, Norcross, GA 30071', phone: 'Call for information', note: 'Granite / Stone Fabricator', storeLocator: 'https://www.georgianstone.com' },
    { name: 'Keystone Granite', contact: 'Kevin & Allison Rice', phone: '706-206-7439', note: 'Quartz/Granite/Soapstone specialty', storeLocator: 'https://www.keystonegranite.com' },
    { name: 'Luxury Landscape Supply', contact: 'Michael Cole', address: '185 Park Access Drive, Lawrenceville, GA 30046', phone: '770-513-3773', note: 'Stone options', storeLocator: 'https://www.luxurylandscapesupply.com' }
  ],
  'Windows & Doors': [
    { name: 'PMC Materials', contact: 'Counter Sales', address: 'Lawrenceville', phone: 'Call for details', note: 'Windows & doors wholesale', storeLocator: 'https://www.pmcmaterials.com' }
  ]
};

function Vendors() {
  const [selectedCategory, setSelectedCategory] = useState('Design');
  const categories = Object.keys(VENDORS_BY_CATEGORY);

  return (
    <div className="vendors-page">
      <h1>Trusted Vendor & Supplier Partners</h1>
      <p className="vendors-subtitle">Your complete resource for quality materials and finishes</p>

      <div className="trade-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`trade-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="vendors-grid">
        {VENDORS_BY_CATEGORY[selectedCategory]?.map((vendor, idx) => (
          <div key={idx} className="vendor-card">
            <h3>{vendor.name}</h3>
            {vendor.subtitle && <p className="vendor-subtitle">{vendor.subtitle}</p>}
            {vendor.company && <p className="vendor-detail"><strong>Company:</strong> {vendor.company}</p>}
            {vendor.contact && <p className="vendor-detail"><strong>Contact:</strong> {vendor.contact}</p>}
            {vendor.address && <p className="vendor-detail"><strong>Address:</strong> {vendor.address}</p>}
            {vendor.phone && <p className="vendor-detail"><strong>Phone:</strong> <a href={`tel:${vendor.phone.split(' ')[0]}`}>{vendor.phone}</a></p>}
            {vendor.email && <p className="vendor-detail"><strong>Email:</strong> <a href={`mailto:${vendor.email}`}>{vendor.email}</a></p>}
            {vendor.website && <p className="vendor-detail"><strong>Website:</strong> <a href={`https://${vendor.website}`} target="_blank" rel="noopener noreferrer">{vendor.website}</a></p>}
            {vendor.fax && <p className="vendor-detail"><strong>Fax:</strong> {vendor.fax}</p>}
            {vendor.hours && <p className="vendor-detail"><strong>Hours:</strong> {vendor.hours}</p>}
            {vendor.note && <p className="vendor-note">{vendor.note}</p>}
            {vendor.storeLocator && (
              <a href={vendor.storeLocator} target="_blank" rel="noopener noreferrer" className="store-locator-btn">
                📍 Find Location
              </a>
            )}
            {vendor.resources && (
              <div className="vendor-resources">
                <p className="resources-label">Quick Links:</p>
                {vendor.resources.map((resource, ridx) => (
                  <a key={ridx} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                    🔗 {resource.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vendors;
