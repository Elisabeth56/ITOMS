-- Demo data for ITOMS. Every person, device and ticket here is invented.
-- All demo accounts share the password: itoms-demo-2026
--   amaka.obi@itoms.example      administrator
--   chidi.eze@itoms.example      IT staff
--   adaeze.okafor@itoms.example  employee
-- Run once on an empty database. Do not run it on a database with real data.

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'amaka.obi@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'chidi.eze@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'adaeze.okafor@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'tunde.bello@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'ngozi.umeh@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'ibrahim.musa@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'funke.adeyemi@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'emeka.nwosu@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000009', 'authenticated', 'authenticated', 'kemi.balogun@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000010', 'authenticated', 'authenticated', 'yusuf.abdullahi@itoms.example', '$2b$10$zrwtx9rkJFEkzxHFzH5gt.pguil4KFUhX4GSwdOwL8115q.SC7m2W', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '{"sub":"a0000000-0000-4000-8000-000000000001","email":"amaka.obi@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', '{"sub":"a0000000-0000-4000-8000-000000000002","email":"chidi.eze@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '{"sub":"a0000000-0000-4000-8000-000000000003","email":"adaeze.okafor@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', '{"sub":"a0000000-0000-4000-8000-000000000004","email":"tunde.bello@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', '{"sub":"a0000000-0000-4000-8000-000000000005","email":"ngozi.umeh@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000006', '{"sub":"a0000000-0000-4000-8000-000000000006","email":"ibrahim.musa@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000007', '{"sub":"a0000000-0000-4000-8000-000000000007","email":"funke.adeyemi@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000008', '{"sub":"a0000000-0000-4000-8000-000000000008","email":"emeka.nwosu@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000009', '{"sub":"a0000000-0000-4000-8000-000000000009","email":"kemi.balogun@itoms.example","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000010', '{"sub":"a0000000-0000-4000-8000-000000000010","email":"yusuf.abdullahi@itoms.example","email_verified":true}', 'email', now(), now(), now());

insert into profiles (id, full_name, email, department, role) values
  ('a0000000-0000-4000-8000-000000000001', 'Amaka Obi', 'amaka.obi@itoms.example', 'IT', 'admin'),
  ('a0000000-0000-4000-8000-000000000002', 'Chidi Eze', 'chidi.eze@itoms.example', 'IT', 'it_staff'),
  ('a0000000-0000-4000-8000-000000000003', 'Adaeze Okafor', 'adaeze.okafor@itoms.example', 'Accounts', 'employee'),
  ('a0000000-0000-4000-8000-000000000004', 'Tunde Bello', 'tunde.bello@itoms.example', 'Sales', 'employee'),
  ('a0000000-0000-4000-8000-000000000005', 'Ngozi Umeh', 'ngozi.umeh@itoms.example', 'Human Resources', 'employee'),
  ('a0000000-0000-4000-8000-000000000006', 'Ibrahim Musa', 'ibrahim.musa@itoms.example', 'Accounts', 'employee'),
  ('a0000000-0000-4000-8000-000000000007', 'Funke Adeyemi', 'funke.adeyemi@itoms.example', 'Front desk', 'employee'),
  ('a0000000-0000-4000-8000-000000000008', 'Emeka Nwosu', 'emeka.nwosu@itoms.example', 'Sales', 'employee'),
  ('a0000000-0000-4000-8000-000000000009', 'Kemi Balogun', 'kemi.balogun@itoms.example', 'Operations', 'employee'),
  ('a0000000-0000-4000-8000-000000000010', 'Yusuf Abdullahi', 'yusuf.abdullahi@itoms.example', 'Operations', 'employee');

insert into assets (id, asset_tag, type, brand, model, serial_number, status, location, purchase_date) values
  ('b0000000-0000-4000-8000-000000000001', 'LAP-0031', 'laptop', 'Dell', 'Latitude 5440', 'DL5440-7731', 'under_repair', null, '2024-02-12'),
  ('b0000000-0000-4000-8000-000000000002', 'LAP-0044', 'laptop', 'HP', 'EliteBook 840', 'HPE840-2210', 'assigned', null, '2025-01-20'),
  ('b0000000-0000-4000-8000-000000000003', 'LAP-0045', 'laptop', 'Lenovo', 'ThinkPad E14', 'LNE14-9034', 'in_stock', 'Store room', '2025-06-03'),
  ('b0000000-0000-4000-8000-000000000004', 'LAP-0038', 'laptop', 'HP', 'ProBook 450', 'HPP450-6612', 'assigned', null, '2024-09-15'),
  ('b0000000-0000-4000-8000-000000000005', 'LAP-0040', 'laptop', 'Dell', 'Latitude 3540', 'DL3540-1187', 'assigned', null, '2024-11-02'),
  ('b0000000-0000-4000-8000-000000000006', 'LAP-0012', 'laptop', 'HP', 'ProBook 440', 'HPP440-0388', 'retired', 'Store room', '2020-03-10'),
  ('b0000000-0000-4000-8000-000000000007', 'DSK-0009', 'desktop', 'Dell', 'OptiPlex 7010', 'DO7010-4471', 'assigned', 'Front desk', '2023-05-18'),
  ('b0000000-0000-4000-8000-000000000008', 'DSK-0011', 'desktop', 'HP', 'ProDesk 400', 'HPD400-5529', 'assigned', 'Operations', '2023-08-22'),
  ('b0000000-0000-4000-8000-000000000009', 'PRN-0007', 'printer', 'HP', 'LaserJet Pro M404', 'VNC3R41077', 'under_repair', '2nd floor, Accounts', '2023-03-14'),
  ('b0000000-0000-4000-8000-000000000010', 'PRN-0004', 'printer', 'Canon', 'imageRUNNER 2425', 'CNR2425-118', 'in_use', 'Front desk', '2022-10-01'),
  ('b0000000-0000-4000-8000-000000000011', 'MON-0015', 'monitor', 'Samsung', '24 inch S24', 'SMS24-7702', 'under_repair', 'Front desk', '2023-05-18'),
  ('b0000000-0000-4000-8000-000000000012', 'MON-0016', 'monitor', 'Dell', 'P2422H', 'DLP24-3319', 'in_stock', 'Store room', '2024-04-09'),
  ('b0000000-0000-4000-8000-000000000013', 'NET-0003', 'network_device', 'TP-Link', 'EAP245 access point', 'TPL245-0090', 'in_use', 'Meeting room', '2022-07-11'),
  ('b0000000-0000-4000-8000-000000000014', 'NET-0001', 'network_device', 'MikroTik', 'RB4011 router', 'MKT4011-221', 'in_use', 'Server room', '2021-11-30'),
  ('b0000000-0000-4000-8000-000000000015', 'PHN-0006', 'phone', 'Samsung', 'Galaxy A54', 'SGA54-6641', 'assigned', null, '2024-06-17'),
  ('b0000000-0000-4000-8000-000000000016', 'LAP-0046', 'laptop', 'Lenovo', 'ThinkPad E14', 'LNE14-9101', 'in_stock', 'Store room', '2026-09-28');

insert into asset_assignments (asset_id, employee_id, assigned_by, assigned_at, returned_at, condition_note) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', now() - interval '400 days', null, null),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', now() - interval '250 days', null, null),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', now() - interval '380 days', null, null),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', now() - interval '330 days', null, null),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', now() - interval '500 days', null, null),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', now() - interval '400 days', null, null),
  ('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', now() - interval '110 days', null, null),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', now() - interval '2000 days', now() - interval '200 days', 'Battery no longer holds charge'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', now() - interval '700 days', now() - interval '385 days', 'Good');

-- oldest first, so reference numbers run in date order
insert into tickets (id, title, description, category, priority, status, reporter_id, assignee_id, asset_id, created_at, resolved_at, closed_at) values
  ('c0000000-0000-4000-8000-000000000012', 'Printer leaves grey streaks on every page', 'All printouts from the Accounts printer have a line down the middle.', 'printer', 'high', 'closed', 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000009', now() - interval '55 days', now() - interval '54 days', now() - interval '53 days'),
  ('c0000000-0000-4000-8000-000000000011', 'Phone does not get company email', 'Email works on my laptop but not on the phone.', 'software', 'low', 'closed', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000015', now() - interval '20 days', now() - interval '19 days', now() - interval '19 days'),
  ('c0000000-0000-4000-8000-000000000010', 'Outlook keeps asking me to sign in', 'Started after I changed my password last week.', 'account', 'medium', 'closed', 'a0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', null, now() - interval '15 days', now() - interval '15 days', now() - interval '14 days'),
  ('c0000000-0000-4000-8000-000000000003', 'New starter needs email and a laptop', 'Kemi''s new assistant starts on the 12th.', 'new_setup', 'medium', 'closed', 'a0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000001', null, now() - interval '12 days', now() - interval '10 days', now() - interval '9 days'),
  ('c0000000-0000-4000-8000-000000000001', 'Shared drive asks for a password every time', 'It asks me to sign in again each time I open the Sales folder.', 'account', 'medium', 'closed', 'a0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', null, now() - interval '9 days', now() - interval '8 days', now() - interval '8 days'),
  ('c0000000-0000-4000-8000-000000000002', 'Laptop battery drains in under an hour', 'Fully charged in the morning and dead before 10am.', 'hardware', 'medium', 'waiting', 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', now() - interval '6 days', null, null),
  ('c0000000-0000-4000-8000-000000000004', 'Projector in the meeting room shows no picture', 'The laptop sees it but the wall stays blank.', 'hardware', 'low', 'closed', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', null, now() - interval '5 days', now() - interval '5 days', now() - interval '4 days'),
  ('c0000000-0000-4000-8000-000000000005', 'Excel freezes when opening the payroll file', 'It hangs for about two minutes on the September payroll workbook.', 'software', 'medium', 'resolved', 'a0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', now() - interval '2 days', now() - interval '5 hours', null),
  ('c0000000-0000-4000-8000-000000000006', 'Monitor flickers after ten minutes', 'It goes black for a second and comes back, over and over.', 'hardware', 'low', 'open', 'a0000000-0000-4000-8000-000000000007', null, 'b0000000-0000-4000-8000-000000000011', now() - interval '26 hours', null, null),
  ('c0000000-0000-4000-8000-000000000007', 'Set up a laptop for the new HR officer', 'She starts on Monday and needs email, the HR system and the printer.', 'new_setup', 'medium', 'assigned', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', null, now() - interval '20 hours', null, null),
  ('c0000000-0000-4000-8000-000000000008', 'Wi-Fi drops in the meeting room', 'Calls cut out whenever more than four of us are in there.', 'network', 'high', 'in_progress', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000013', now() - interval '4 hours', null, null),
  ('c0000000-0000-4000-8000-000000000009', 'Printer on 2nd floor jams on every page', 'Since this morning. I removed the stuck paper twice but it jams again. We need it for month-end invoices today.', 'printer', 'urgent', 'open', 'a0000000-0000-4000-8000-000000000003', null, 'b0000000-0000-4000-8000-000000000009', now() - interval '20 minutes', null, null);

insert into ticket_events (ticket_id, actor_id, type, from_value, to_value, created_at) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000008', 'created', null, 'open', now() - interval '9 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '9 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '9 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'assigned', 'in_progress', now() - interval '9 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'in_progress', 'resolved', now() - interval '8 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000008', 'status_changed', 'resolved', 'closed', now() - interval '8 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000006', 'created', null, 'open', now() - interval '6 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '6 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '6 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'assigned', 'in_progress', now() - interval '6 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'in_progress', 'waiting', now() - interval '6 days' + interval '20 minutes'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000009', 'created', null, 'open', now() - interval '12 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000001', now() - interval '12 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '12 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'assigned', 'in_progress', now() - interval '12 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'in_progress', 'resolved', now() - interval '10 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000009', 'status_changed', 'resolved', 'closed', now() - interval '9 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'created', null, 'open', now() - interval '5 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '5 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '5 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'priority_changed', 'medium', 'low', now() - interval '5 days' + interval '6 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'assigned', 'in_progress', now() - interval '5 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'in_progress', 'resolved', now() - interval '5 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'status_changed', 'resolved', 'closed', now() - interval '4 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000006', 'created', null, 'open', now() - interval '2 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000001', now() - interval '2 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '2 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'assigned', 'in_progress', now() - interval '2 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'in_progress', 'resolved', now() - interval '5 hours' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000007', 'created', null, 'open', now() - interval '26 hours' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'priority_changed', 'medium', 'low', now() - interval '26 hours' + interval '6 minutes'),
  ('c0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000005', 'created', null, 'open', now() - interval '20 hours' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '20 hours' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '20 hours' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000004', 'created', null, 'open', now() - interval '4 hours' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '4 hours' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '4 hours' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'priority_changed', 'medium', 'high', now() - interval '4 hours' + interval '6 minutes'),
  ('c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'assigned', 'in_progress', now() - interval '4 hours' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000003', 'created', null, 'open', now() - interval '20 minutes' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 'priority_changed', 'medium', 'urgent', now() - interval '20 minutes' + interval '6 minutes'),
  ('c0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000010', 'created', null, 'open', now() - interval '15 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000001', now() - interval '15 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '15 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'assigned', 'in_progress', now() - interval '15 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'in_progress', 'resolved', now() - interval '15 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000010', 'status_changed', 'resolved', 'closed', now() - interval '14 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000008', 'created', null, 'open', now() - interval '20 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '20 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '20 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 'priority_changed', 'medium', 'low', now() - interval '20 days' + interval '6 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'assigned', 'in_progress', now() - interval '20 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'in_progress', 'resolved', now() - interval '19 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000008', 'status_changed', 'resolved', 'closed', now() - interval '19 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000006', 'created', null, 'open', now() - interval '55 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'assigned', null, 'a0000000-0000-4000-8000-000000000002', now() - interval '55 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'status_changed', 'open', 'assigned', now() - interval '55 days' + interval '5 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'priority_changed', 'medium', 'high', now() - interval '55 days' + interval '6 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'assigned', 'in_progress', now() - interval '55 days' + interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'status_changed', 'in_progress', 'resolved', now() - interval '54 days' + interval '0 minutes'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000006', 'status_changed', 'resolved', 'closed', now() - interval '53 days' + interval '0 minutes');

insert into ticket_comments (ticket_id, author_id, body, is_internal, created_at) values
  ('c0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 'Thanks Adaeze. Please use the printer at the front desk for now. I am coming up to look at it.', false, now() - interval '12 minutes'),
  ('c0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 'Same fault as August. The fuser was replaced then. If it is the pickup roller this time we should ask for a quote on a replacement unit.', true, now() - interval '10 minutes'),
  ('c0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'I have moved the access point closer to the table and am watching the signal during your 2pm call.', false, now() - interval '3 hours'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'The battery has failed. A replacement is on order and should arrive this week.', false, now() - interval '5 days'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Ordered from the usual supplier, delivery expected Thursday.', true, now() - interval '5 days'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'I repaired the Office install and the file now opens in a few seconds. Please check and confirm.', false, now() - interval '5 hours'),
  ('c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'Replaced the fuser unit. Test pages are clean.', false, now() - interval '54 days'),
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'Your saved sign-in had expired. I have reconnected the drive.', false, now() - interval '8 days');

insert into maintenance_logs (asset_id, ticket_id, performed_by, action, parts, cost, performed_at) values
  ('b0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'Replaced the fuser unit after repeated jams and streaks.', 'Fuser unit', 48000, now() - interval '54 days'),
  ('b0000000-0000-4000-8000-000000000009', null, 'a0000000-0000-4000-8000-000000000001', 'Cleaned the rollers and replaced the toner cartridge.', 'Toner cartridge', 15500, now() - interval '240 days'),
  ('b0000000-0000-4000-8000-000000000006', null, 'a0000000-0000-4000-8000-000000000002', 'Battery tested and found dead. Device retired.', null, null, now() - interval '200 days'),
  ('b0000000-0000-4000-8000-000000000015', 'c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 'Removed and re-added the company email account.', null, null, now() - interval '19 days'),
  ('b0000000-0000-4000-8000-000000000013', null, 'a0000000-0000-4000-8000-000000000002', 'Updated firmware and changed the Wi-Fi channel.', null, null, now() - interval '90 days');

insert into ai_suggestions (user_id, category, title, description, can_help, summary, steps, outcome, ticket_id, model, created_at) values
  ('a0000000-0000-4000-8000-000000000007', 'printer', 'Front desk printer says offline', '', true, 'The printer has probably lost its connection.', '["Turn the printer off and wait 30 seconds.", "Turn it back on and print one page."]', 'solved', null, 'groq/openai/gpt-oss-20b', now() - interval '3 days'),
  ('a0000000-0000-4000-8000-000000000004', 'software', 'Zoom has no sound', '', true, 'Zoom may be using the wrong speaker.', '["Check that the laptop is not muted.", "In Zoom, open audio settings and pick your headset."]', 'solved', null, 'groq/openai/gpt-oss-20b', now() - interval '7 days'),
  ('a0000000-0000-4000-8000-000000000003', 'printer', 'Printer on 2nd floor jams on every page', 'I removed the stuck paper twice but it jams again.', false, 'A jam that keeps coming back needs IT to look at the printer.', '[]', 'ticket_filed', 'c0000000-0000-4000-8000-000000000009', 'groq/openai/gpt-oss-20b', now() - interval '21 minutes');
