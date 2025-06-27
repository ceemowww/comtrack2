-- Demo company data for ComTrack

INSERT INTO companies (name, slug, description) VALUES 
('Acme Corporation', 'acme-corp', 'A demo company for testing ComTrack features');

-- Demo customers for Acme Corporation (B2B customers)
INSERT INTO customers (company_id, name, email, phone, address) VALUES 
(1, 'TechStart Industries', 'procurement@techstart.com', '555-0101', '123 Innovation Blvd, Silicon Valley, CA'),
(1, 'Metro Manufacturing', 'orders@metromanufacturing.com', '555-0102', '456 Factory Lane, Detroit, MI'),
(1, 'Global Retail Group', 'purchasing@globalretail.com', '555-0103', '789 Commerce Plaza, New York, NY');

-- Demo suppliers for Acme Corporation (B2B suppliers)
INSERT INTO suppliers (company_id, name, contact_person, email, phone, address) VALUES 
(1, 'Industrial Components LLC', 'Sales Manager', 'sales@industrialcomponents.com', '555-0201', '100 Manufacturing Dr, Cleveland, OH'),
(1, 'Premium Materials Corp', 'Account Executive', 'accounts@premiummaterials.com', '555-0202', '200 Supply Chain Blvd, Atlanta, GA'),
(1, 'Logistics Solutions Inc', 'Business Development', 'bd@logisticssolutions.com', '555-0203', '300 Distribution Way, Chicago, IL');