-- Demo parts data for Acme Corporation suppliers

-- Parts for Industrial Components LLC (supplier_id = 1) - 5 parts
INSERT INTO parts (company_id, supplier_id, sku, name, description, price) VALUES 
(1, 1, 'IC-BOLT-001', 'Stainless Steel Bolt M8x50', 'High-grade stainless steel bolt for industrial applications', 2.50),
(1, 1, 'IC-NUT-002', 'Hex Nut M8', 'Stainless steel hex nut compatible with M8 bolts', 0.75),
(1, 1, 'IC-WASHER-003', 'Flat Washer M8', 'Zinc-plated flat washer for M8 bolts', 0.25),
(1, 1, 'IC-BEARING-004', 'Ball Bearing 6205-2RS', 'Deep groove ball bearing with rubber seals', 15.99),
(1, 1, 'IC-GASKET-005', 'Rubber Gasket 4"', 'NBR rubber gasket for 4-inch flanges', 8.50);

-- Parts for Premium Materials Corp (supplier_id = 2) - 12 parts
INSERT INTO parts (company_id, supplier_id, sku, name, description, price) VALUES 
(1, 2, 'PM-STEEL-101', 'Steel Rod 1/2" x 12ft', 'Cold rolled steel rod for fabrication', 24.99),
(1, 2, 'PM-STEEL-102', 'Steel Plate 1/4" x 4x8', 'Hot rolled steel plate 1/4 inch thick', 89.50),
(1, 2, 'PM-ALUM-103', 'Aluminum Bar 1" x 1" x 8ft', '6061 aluminum square bar stock', 32.75),
(1, 2, 'PM-COPPER-104', 'Copper Pipe 1/2" x 10ft', 'Type L copper water pipe', 18.25),
(1, 2, 'PM-BRASS-105', 'Brass Fitting 1/2" Elbow', '90-degree brass pipe elbow', 4.50),
(1, 2, 'PM-STAINLESS-106', 'Stainless Steel Sheet 16GA', '304 stainless steel sheet 4x8', 125.00),
(1, 2, 'PM-CARBON-107', 'Carbon Fiber Tube 1" OD', 'Lightweight carbon fiber tubing', 45.99),
(1, 2, 'PM-TITANIUM-108', 'Titanium Wire 0.1mm', 'Grade 1 titanium wire for precision work', 78.50),
(1, 2, 'PM-NICKEL-109', 'Nickel Plate 2" x 2"', 'Pure nickel electroplating anode', 22.99),
(1, 2, 'PM-ZINC-110', 'Zinc Rod 1/4" x 6"', 'Pure zinc rod for galvanizing', 8.75),
(1, 2, 'PM-LEAD-111', 'Lead Sheet 1/8" x 12x12', 'Pure lead sheet for radiation shielding', 35.50),
(1, 2, 'PM-TIN-112', 'Tin Ingot 1lb', 'Pure tin ingot for soldering applications', 28.99);

-- Parts for Logistics Solutions Inc (supplier_id = 3) - 13 parts
INSERT INTO parts (company_id, supplier_id, sku, name, description, price) VALUES 
(1, 3, 'LS-PALLET-201', 'Wooden Pallet 48"x40"', 'Standard GMA wooden shipping pallet', 12.50),
(1, 3, 'LS-BOX-202', 'Cardboard Box 12x8x6', 'Single wall corrugated shipping box', 1.25),
(1, 3, 'LS-TAPE-203', 'Packing Tape 2" x 55yd', 'Clear acrylic packaging tape', 3.99),
(1, 3, 'LS-BUBBLE-204', 'Bubble Wrap 12" x 50ft', 'Protective bubble wrap roll', 8.75),
(1, 3, 'LS-LABEL-205', 'Shipping Labels 4x6', 'Thermal transfer shipping labels (100 pack)', 15.50),
(1, 3, 'LS-STRETCH-206', 'Stretch Wrap 18" x 1500ft', 'Industrial stretch wrap film', 22.99),
(1, 3, 'LS-FOAM-207', 'Packing Foam Insert', 'Custom-cut protective foam insert', 5.50),
(1, 3, 'LS-MAILER-208', 'Poly Mailer 10x13', 'Self-sealing polyethylene mailer', 0.85),
(1, 3, 'LS-CORNER-209', 'Edge Protector 2" x 35"', 'Cardboard corner protector for shipping', 1.75),
(1, 3, 'LS-CRATE-210', 'Wooden Crate 24x18x12', 'Heavy-duty wooden shipping crate', 35.00),
(1, 3, 'LS-DESICCANT-211', 'Silica Gel Pack 10g', 'Moisture absorber for packaging', 0.50),
(1, 3, 'LS-FRAGILE-212', 'Fragile Stickers (50 pack)', 'Warning labels for delicate items', 4.25),
(1, 3, 'LS-INVENTORY-213', 'Barcode Labels (1000 pack)', 'Adhesive barcode labels for inventory', 18.99);