-- Shared devices (printers, access points) have a place but no single holder.
alter type asset_status add value if not exists 'in_use' after 'assigned';
