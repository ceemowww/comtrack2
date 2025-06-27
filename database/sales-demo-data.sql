-- Demo sales orders for Acme Corporation

-- Sales order for TechStart Industries (customer_id = 1)
INSERT INTO sales_orders (company_id, customer_id, po_number, order_date, status, notes) VALUES 
(1, 1, 'PO-2024-001', '2024-06-01', 'pending', 'Initial order for new product line');

-- Sales order for Metro Manufacturing (customer_id = 2)
INSERT INTO sales_orders (company_id, customer_id, po_number, order_date, status, notes) VALUES 
(1, 2, 'PO-2024-002', '2024-06-15', 'confirmed', 'Bulk order for manufacturing run');

-- Sales order for Global Retail Group (customer_id = 3)
INSERT INTO sales_orders (company_id, customer_id, po_number, order_date, status, notes) VALUES 
(1, 3, 'PO-2024-003', '2024-06-20', 'shipped', 'Rush order for retail launch');

-- Line items for sales order 1 (TechStart Industries)
INSERT INTO sales_order_items (company_id, sales_order_id, part_id, supplier_id, quantity, unit_price, commission_percentage) VALUES 
(1, 1, 1, 1, 100, 2.50, 5.0),  -- IC-BOLT-001 from Industrial Components LLC (5% commission)
(1, 1, 2, 1, 100, 0.75, 5.0),  -- IC-NUT-002 from Industrial Components LLC (5% commission)
(1, 1, 6, 2, 10, 24.99, 8.0);  -- PM-STEEL-101 from Premium Materials Corp (8% commission)

-- Line items for sales order 2 (Metro Manufacturing)
INSERT INTO sales_order_items (company_id, sales_order_id, part_id, supplier_id, quantity, unit_price, commission_percentage) VALUES 
(1, 2, 11, 2, 5, 125.00, 8.0), -- PM-STAINLESS-106 from Premium Materials Corp (8% commission)
(1, 2, 18, 3, 50, 12.50, 6.0), -- LS-PALLET-201 from Logistics Solutions Inc (6% commission)
(1, 2, 23, 3, 20, 22.99, 6.0); -- LS-STRETCH-206 from Logistics Solutions Inc (6% commission)

-- Line items for sales order 3 (Global Retail Group)
INSERT INTO sales_order_items (company_id, sales_order_id, part_id, supplier_id, quantity, unit_price, commission_percentage) VALUES 
(1, 3, 19, 3, 200, 1.25, 6.0), -- LS-BOX-202 from Logistics Solutions Inc (6% commission)
(1, 3, 21, 3, 50, 8.75, 6.0),  -- LS-BUBBLE-204 from Logistics Solutions Inc (6% commission)
(1, 3, 20, 3, 100, 3.99, 6.0), -- LS-TAPE-203 from Logistics Solutions Inc (6% commission)
(1, 3, 4, 1, 25, 15.99, 5.0);  -- IC-BEARING-004 from Industrial Components LLC (5% commission)

-- Update total amounts for sales orders (based on line items)
UPDATE sales_orders SET total_amount = (
    SELECT COALESCE(SUM(line_total), 0) 
    FROM sales_order_items 
    WHERE sales_order_id = sales_orders.id
);