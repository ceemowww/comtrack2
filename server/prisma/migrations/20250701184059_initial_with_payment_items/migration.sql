-- CreateTable
CREATE TABLE "commission_allocations" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "commission_payment_item_id" INTEGER NOT NULL,
    "sales_order_item_id" INTEGER NOT NULL,
    "allocated_amount" DECIMAL(12,2) NOT NULL,
    "allocation_date" DATE DEFAULT CURRENT_DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_payment_items" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "commission_payment_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_payment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_payments" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_amount" DECIMAL(12,2) NOT NULL,
    "payment_reference" VARCHAR(100),
    "notes" TEXT,
    "status" VARCHAR(50) DEFAULT 'received',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "sku" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "sales_order_id" INTEGER NOT NULL,
    "part_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "line_total" DECIMAL(12,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "commission_rate" DECIMAL(5,4) DEFAULT 0.0000,
    "commission_percentage" DECIMAL(5,2) DEFAULT 0.00,
    "commission_amount" DECIMAL(12,2),

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "po_number" VARCHAR(100) NOT NULL,
    "order_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(12,2) DEFAULT 0.00,
    "notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "total_commission" DECIMAL(12,2) DEFAULT 0.00,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "address" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_commission_allocations_company_id" ON "commission_allocations"("company_id");

-- CreateIndex
CREATE INDEX "idx_commission_allocations_order_item_id" ON "commission_allocations"("sales_order_item_id");

-- CreateIndex
CREATE INDEX "idx_commission_allocations_payment_item_id" ON "commission_allocations"("commission_payment_item_id");

-- CreateIndex
CREATE INDEX "idx_commission_payment_items_company_id" ON "commission_payment_items"("company_id");

-- CreateIndex
CREATE INDEX "idx_commission_payment_items_payment_id" ON "commission_payment_items"("commission_payment_id");

-- CreateIndex
CREATE INDEX "idx_commission_payments_company_id" ON "commission_payments"("company_id");

-- CreateIndex
CREATE INDEX "idx_commission_payments_supplier_id" ON "commission_payments"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "idx_customers_company_id" ON "customers"("company_id");

-- CreateIndex
CREATE INDEX "idx_parts_company_id" ON "parts"("company_id");

-- CreateIndex
CREATE INDEX "idx_parts_sku" ON "parts"("company_id", "sku");

-- CreateIndex
CREATE INDEX "idx_parts_supplier_id" ON "parts"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "parts_company_id_sku_key" ON "parts"("company_id", "sku");

-- CreateIndex
CREATE INDEX "idx_sales_order_items_company_id" ON "sales_order_items"("company_id");

-- CreateIndex
CREATE INDEX "idx_sales_order_items_order_id" ON "sales_order_items"("sales_order_id");

-- CreateIndex
CREATE INDEX "idx_sales_order_items_part_id" ON "sales_order_items"("part_id");

-- CreateIndex
CREATE INDEX "idx_sales_order_items_supplier_id" ON "sales_order_items"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_sales_orders_company_id" ON "sales_orders"("company_id");

-- CreateIndex
CREATE INDEX "idx_sales_orders_customer_id" ON "sales_orders"("customer_id");

-- CreateIndex
CREATE INDEX "idx_sales_orders_po_number" ON "sales_orders"("company_id", "customer_id", "po_number");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_company_id_customer_id_po_number_key" ON "sales_orders"("company_id", "customer_id", "po_number");

-- CreateIndex
CREATE INDEX "idx_suppliers_company_id" ON "suppliers"("company_id");

-- AddForeignKey
ALTER TABLE "commission_allocations" ADD CONSTRAINT "commission_allocations_commission_payment_item_id_fkey" FOREIGN KEY ("commission_payment_item_id") REFERENCES "commission_payment_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission_allocations" ADD CONSTRAINT "commission_allocations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission_allocations" ADD CONSTRAINT "commission_allocations_sales_order_item_id_fkey" FOREIGN KEY ("sales_order_item_id") REFERENCES "sales_order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission_payment_items" ADD CONSTRAINT "commission_payment_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission_payment_items" ADD CONSTRAINT "commission_payment_items_commission_payment_id_fkey" FOREIGN KEY ("commission_payment_id") REFERENCES "commission_payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
