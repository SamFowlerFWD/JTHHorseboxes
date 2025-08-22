-- ======================================================
-- Monday.com data import
-- File: 03_monday_data
-- Original: supabase/migrations/002_monday_data_import.sql
-- Generated: 2025-08-22T15:17:20.944Z
-- ======================================================

-- Monday.com Data Import
-- Generated: 2025-08-22T13:35:28.966084
-- This migration imports data from Monday.com export


-- Import Additional Team Members

INSERT INTO users (email, full_name, role, department, is_active)
VALUES ('workshop@jthltd.co.uk', 'Steven Warner', 'admin', 'Operations', true)
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Import Workshop Accounts (Suppliers)

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('ea03183c-84ec-4d0f-a56e-0d60df12d5b5', 'Ostermann (Edge banding)', 'business', 'https://www.ostermann.eu/en_GB', 
    '{"customer_number": '2020177', "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('5056b7f8-33f1-4ab8-9762-6d8963a62afb', 'ELESA (spring pins etc)', 'business', 'https://www.elesa.com/en/elesab2bstoreuk', 
    '{"customer_number": 'jthltd', "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('6482a939-6bb2-497f-ba9e-bfd5915ae8f4', 'Metrol Springs', 'business', 'https://www.metrol.com/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO contacts (id, organization_id, first_name, last_name, email, role)
VALUES ('00a2bac2-2064-4be9-b10e-b09acd32414a', '6482a939-6bb2-497f-ba9e-bfd5915ae8f4', 'Jack Bannister', '', 'Jackbannister@metrol.com', 'Sales Representative');

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('c3b39f93-a607-49d6-9396-652d212beb58', 'Solmer (drawer runners)', 'business', 'https://www.solmer.co.uk/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('d8ed2014-4341-4343-9c10-39f3c4acbfaf', 'GSEquestrian', 'business', 'https://gsequestrian.co.uk/?country=GB', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('a55c829d-0ac9-4fd1-8194-e2ae0cde3886', 'Renogy', 'business', 'https://uk.renogy.com/', 
    '{"customer_number": '1450436', "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('f6d36a98-717f-41c6-8109-95991d7123c6', 'Eco Worthy', 'business', 'https://uk.eco-worthy.com/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('326d7ebd-188e-4bef-a92e-77766a26c6ab', 'Blackheath Products (laminate)', 'business', 'https://www.blackheathproducts.co.uk/', 
    '{"customer_number": NULL, "login": 'workshop@jthltd.co.uk'}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('39f7d288-7011-4a42-89ab-53a1b658b85d', 'Item 4', 'business', NULL, 
    '{"customer_number": NULL, "login": NULL}'::jsonb);

INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('aa2a441e-6c31-41e8-8bbb-ef45cd778fb1', 'Item 5', 'business', NULL, 
    '{"customer_number": NULL, "login": NULL}'::jsonb);

-- Import JTH Products (Parts/Accessories)

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('9b2b40b8-f62b-48fe-adaf-e3dcc74adedb', 'OPT-0002', 'Sliding partition Indexing Plunger', 'Horse Area Equipment', 
    33.5, 'https://www.elesa.com/ProductDisplay?storeId=10155&catalogId=10058&langId=-1&urlLangId=-1&parentCatEntryId=198004&productId=61981&categoryId=&top_category=&urlRequestType=Base&pageName=CatalogEntryPage', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('107da3f2-ed21-4a6c-ae3a-d82ef58fbb3f', 'OPT-0003', 'Item 2', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('f1de6f1e-b1ce-41df-8f69-4fa79b6ff12c', 'OPT-0004', 'Item 3', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('68bb4f48-d597-41fb-9d99-598b08a2162c', 'OPT-0006', 'Grooms', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('37c4e721-1d10-4de2-96c8-b41a63f4bc33', 'OPT-0008', 'Saddle Rack', 'Horse Area Equipment', 
    10.68, 'https://gsequestrian.co.uk/products/perry-equestrian-standard-saddle-rack?variant=31328427606064&gad_source=1&gad_campaignid=19899447738&gbraid=0AAAAADuamB-yWjEcx8qOG_nMmUYNic1c4&gclid=Cj0KCQjwndHEBhDVARIsAGh0g3AIt_qkwI3yw3RiHtPhLGM8WZMVM_Fu4qSik_OnGKmLjc3oU75mTvUaAiFGEALw_wcB', 2);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('6992effe-6eca-4bc7-bb78-bb9850fc7872', 'OPT-0009', 'Bridle Hook', 'Horse Area Equipment', 
    4.5, 'https://gsequestrian.co.uk/products/shires-bridle-rack-976', 2);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('58a2b380-d461-48c9-a227-5013bbc2fde6', 'OPT-0010', 'Laminate', 'Horse Area Equipment', 
    0, 'https://www.blackheathproducts.co.uk/', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('c2d74aee-62bc-4f2e-a701-f950306dce0f', 'OPT-0011', 'Stick on veneer', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('c705114f-cf55-42a9-89f9-4ea17ac8d7de', 'OPT-0012', 'Drawer Boxes', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('6a85d411-08dd-43d4-b82e-6f8cd98dd7d2', 'OPT-0014', 'Electrics', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('9bac8a61-cbcf-46b3-ac47-81dd90217558', 'OPT-0016', '100A Lithium Battery', 'Horse Area Equipment', 
    179.99, 'https://uk.eco-worthy.com/collections/12v-lifepo4-lithium-battery/products/lifepo4-12v-100ah-lithium-iron-phosphate-battery', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('18de6f44-d183-4810-bf9d-b3506ec16b61', 'OPT-0017', '40A DC to DC Charger', 'Horse Area Equipment', 
    0, 'https://uk.renogy.com/collections/dc-to-dc-battery-charger/products/12v-40a-dc-to-dc-battery-charger', 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('ece32fc4-6438-4d46-995d-b1d8dcac174f', 'OPT-0018', 'AC to AC Charger', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('7b14f599-ee70-4c6f-af85-62143f56a5d5', 'OPT-0019', '12v Fuse box', 'Horse Area Equipment', 
    0, NULL, 1);

INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('203cb2f2-5387-4f14-84e4-4a9ba7c09eff', 'OPT-0020', '12v Bus Bar', 'Horse Area Equipment', 
    0, NULL, 1);

-- Import Workshop Jobs

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('ac3692f1-1df9-4301-b862-b53799bfb2db', 'JOB-0003', 'scheduled', 'Name', 
    'Date for Paint');

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('f869bfdc-9583-4642-bf27-3defb63bbcf2', 'JOB-0004', 'in_progress', 'LC20 BXK Professional 45 Kathy Webb', 
    '2025-08-25T00:00:00');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('5e8d05ed-c5f0-4089-bbd8-529172e7d172', 'f869bfdc-9583-4642-bf27-3defb63bbcf2', 'Name', 5, 'pending', 
    'Owner');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('fffa0d71-a307-4787-9c87-8d939f62bb03', 'f869bfdc-9583-4642-bf27-3defb63bbcf2', 'Finish off ramp bottom', 6, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('ccedf02d-798f-47e4-9f3f-a26c41beda2a', 'f869bfdc-9583-4642-bf27-3defb63bbcf2', 'Paint', 7, 'pending', 
    NULL);

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('3befe885-4ec2-441d-8a2a-5587ba35d1d4', 'JOB-0008', 'in_progress', 'LR21 WWG Blue professional 35', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('6514f17f-0df5-4695-a672-68c576f8b9e6', '3befe885-4ec2-441d-8a2a-5587ba35d1d4', 'Name', 9, 'pending', 
    'Owner');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('49eedf94-bd60-42ec-b9e0-acdd7f8e48e2', '3befe885-4ec2-441d-8a2a-5587ba35d1d4', 'Fit shelf in living and water pipes', 10, 'in_progress', 
    NULL);

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('0572ac07-f2ac-45fe-9ef1-0713a9057ae3', 'JOB-0013', 'scheduled', 'Name', 
    'Date for Paint');

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('fc710e9f-19a6-4c1e-a50a-52f23690d939', 'JOB-0014', 'scheduled', 'CA69 LVX Professional 35 HIRE BOX', 
    '2025-08-22T00:00:00');

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('f43c9814-864a-47cf-a054-cabdcfe57041', 'JOB-0015', 'scheduled', 'MX57 KFZ MAN Lorry', 
    '2025-08-24T00:00:00');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('fbfbd426-b962-4e36-8494-54aa4cf44de9', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Name', 16, 'pending', 
    'Owner');

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('5b94bcf5-8538-4bc2-9a96-966ffbd9aadc', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Remove windscreen and Straighten A pillar', 17, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('479050ca-1827-4634-b36f-afca79abd106', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Source A pillar from scrap yard', 18, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('86a751d4-f625-4bbe-84fb-0af92e364c70', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Weld in A pillar', 19, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('ee8d48df-7d04-4f63-9470-762d30e41b28', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Install pod', 20, 'pending', 
    NULL);

INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('76212bda-ffd8-47db-996d-ac5ef3633011', 'f43c9814-864a-47cf-a054-cabdcfe57041', 'Paint', 21, 'pending', 
    NULL);

INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('3783ac73-0337-410e-ae51-f7aa6e2cdcf7', 'JOB-0024', 'scheduled', 'Name', 
    'Date for Paint');

-- Create sample sales pipeline data

-- Sample customer organization
INSERT INTO organizations (id, name, type)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Kathy Webb Equestrian', 'individual');

-- Sample contact
INSERT INTO contacts (id, organization_id, first_name, last_name, email, phone)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 
    'Kathy', 'Webb', 'kathy.webb@example.com', '+447917016406');

-- Sample address
INSERT INTO addresses (organization_id, type, line1, city, postcode)
VALUES ('a0000000-0000-0000-0000-000000000001', 'both', 
    '123 Example Lane', 'York', 'YO1 2AB');

-- Sample lead
INSERT INTO leads (organization_id, contact_id, source, stage, status)
VALUES ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
    'website', 'quotation', 'active');

-- Sample quote for Pro 4.5
INSERT INTO quotes (quote_number, organization_id, contact_id, model_id, 
    base_price, options_price, subtotal, vat_amount, total_amount, status)
SELECT 'QUO-2025-0001', 'a0000000-0000-0000-0000-000000000001', 
    'b0000000-0000-0000-0000-000000000001', id,
    62000, 5000, 67000, 13400, 80400, 'sent'
FROM product_models WHERE model_code = 'JTH-AEOS-45P';

-- Sample order
INSERT INTO orders (order_number, quote_id, organization_id, contact_id, 
    status, total_amount, deposit_paid, balance_due)
SELECT 'JTH-2025-08-0001', id, 'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001', 'in_production', 80400, 16080, 64320
FROM quotes WHERE quote_number = 'QUO-2025-0001';
    