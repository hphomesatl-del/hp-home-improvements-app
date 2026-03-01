import React, { useState } from 'react';
import '../styles/Vendors.css';

const VENDORS_BY_CATEGORY = {
  'Design': [
    { name: 'Teresa Hamilton', company: 'TL Hamilton Designs, Inc', email: 'tlhamiltondesign81@gmail.com', phone: '678-571-7533' }
  ],
  'Tile & Flooring': [
    { name: 'Floor and Decor', address: '1690 Northeast Expy NE, Atlanta, GA 30329', website: 'www.flooranddecor.com', note: 'Floor and Decor Mall of Georgia - I85 Frontage rd' },
    { name: 'ProSource', subtitle: 'Flooring/Tile', contact: 'John Timper', address: '3000 Miller Court West, Norcross, GA 30071', website: 'www.prosourcewholesale.com' },
    { name: 'Specialty Tile Products, Inc.', contact: 'Denise Taylor | Showroom Sales', address: '721 Miami Circle, Suite 107, Atlanta, GA 30324', phone: '404-941-1777 (Direct) / 404-264-0727 (Office)', website: 'SpecialtyTile.com' }
  ],
  'Plumbing Fixtures': [
    { name: 'PDI - Roswell', subtitle: 'Master Bath Plumbing Fixtures', contact: 'Shelby Swann', address: '1021 Mansell Road, Roswell, GA 30076', phone: '678-781-9240', email: 'sswann@plumbingdistributors.com' },
    { name: 'PDI - Lawrenceville', subtitle: 'Plumbing / Lighting Fixtures', contact: 'Tawney Patterson', address: '1025 Old Norcross Rd, Lawrenceville, GA 30046-1166', phone: '678-326-1825', email: 'TPatterson@relyonpdi.co' },
    { name: 'eFaucets.com', website: 'Efaucets.com', note: 'Plumbing Fixtures' },
    { name: 'Lowes', note: 'Plumbing fixtures' },
    { name: 'Home Depot', note: 'Plumbing fixtures' }
  ],
  'Lighting': [
    { name: 'Progressive Lighting', website: 'progresslighting.com' },
    { name: 'Georgia Lighting', contact: 'Frank / Linda', address: '120 Peachtree Industrial Blvd, Sugar Hill, GA 30518' }
  ],
  'Cabinets': [
    { name: 'Wheeler Woodworks', subtitle: 'Elite Grade Cabinets', contact: 'Donna Wheeler', phone: '770-307-1684', website: 'http://www.wheelerwoodworks.net/main.html' },
    { name: 'Suwanee Decorative Hardware Inc.', website: 'www.DoorHardwareUSA.com', phone: '770-623-1530 (Showroom) / 770-623-1540 (Sales) / 866-366-4066 (Toll Free)', address: '1810 Peachtree Industrial Blvd STE 115, Duluth, GA 30097' },
    { name: 'Budget Cabinets', note: '12 different styles', website: 'http://jk2kitchenbath.com' }
  ],
  'Vanities': [
    { name: 'Hardware Resources', website: 'www.Hardwareresources.com', note: 'Vanities and mirrors' },
    { name: 'Wayfair', website: 'https://www.wayfair.com', note: 'Bathroom vanities' }
  ],
  'Stone & Slabs': [
    { name: 'The Levantina Atlanta Showroom', address: '2499 Newpoint Parkway Suite #300, Lawrenceville, GA 30043', phone: '678-436-5439', email: 'atlantasales@levantinausa.com', hours: 'Mon-Fri 8AM-5PM, Sat 10AM-2PM' },
    { name: 'Stone Showcase', address: '1785 Enterprise Dr Suite B, Buford, GA 30518', phone: '678-546-6166', fax: '678-546-1445', hours: 'Mon-Fri 9am-5pm, Sat 10am-1pm' },
    { name: 'Georgian Stone Corp', address: '3045 Business Park Drive Suite A, Norcross, GA 30071', contact: 'Jim - Stone Solutions Rep', note: 'Granite / Stone Fabricator' },
    { name: 'Keystone Granite', contact: 'Kevin & Allison Rice', phone: '706-206-7439', note: 'Quartz/Granite/Soap Stone' },
    { name: 'Luxury Landscape Supply', address: '185 Park Access Drive, Lawrenceville, GA 30046', contact: 'Michael Cole', phone: '770-513-3773' },
    { name: 'Walter Stone Creations', note: 'Stone Countertops' }
  ],
  'Windows & Doors': [
    { name: 'PMC Materials', address: 'Lawrenceville' }
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vendors;
