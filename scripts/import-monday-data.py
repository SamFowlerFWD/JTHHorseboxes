#!/usr/bin/env python3
"""
Import Monday.com data into Supabase seed file
"""

import pandas as pd
import json
import uuid
from pathlib import Path
from datetime import datetime

# Base path for Monday.com export
BASE_PATH = Path("/Users/samfowler/Downloads/account_30931737_data_1755775990")
OUTPUT_PATH = Path("/Users/samfowler/JTH-New/supabase/migrations/002_monday_data_import.sql")

def generate_uuid():
    """Generate a UUID for SQL"""
    return str(uuid.uuid4())

def clean_value(val):
    """Clean value for SQL insertion"""
    if pd.isna(val):
        return 'NULL'
    if isinstance(val, str):
        # Escape single quotes
        val = val.replace("'", "''")
        return f"'{val}'"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, datetime):
        return f"'{val.isoformat()}'"
    return 'NULL'

def import_workshop_accounts():
    """Import Workshop Accounts as Organizations and Contacts"""
    file_path = BASE_PATH / "boards" / "2108524720_Workshop accounts.xlsx"
    df = pd.read_excel(file_path, engine='openpyxl')
    
    sql_statements = []
    sql_statements.append("\n-- Import Workshop Accounts (Suppliers)")
    
    # Skip header rows and process actual data
    for idx, row in df.iterrows():
        if idx < 2:  # Skip headers
            continue
            
        if pd.notna(row.iloc[0]) and row.iloc[0] not in ['Group Title', 'Name']:
            org_id = generate_uuid()
            name = row.iloc[0]  # Company name
            link = row.iloc[1] if pd.notna(row.iloc[1]) else None
            login = row.iloc[2] if pd.notna(row.iloc[2]) else None
            password = row.iloc[3] if pd.notna(row.iloc[3]) else None
            customer_num = row.iloc[4] if pd.notna(row.iloc[4]) else None
            rep_name = row.iloc[5] if pd.notna(row.iloc[5]) else None
            rep_email = row.iloc[6] if pd.notna(row.iloc[6]) else None
            
            # Insert organization
            sql_statements.append(f"""
INSERT INTO organizations (id, name, type, website, metadata)
VALUES ('{org_id}', {clean_value(name)}, 'business', {clean_value(link)}, 
    '{{"customer_number": {clean_value(customer_num)}, "login": {clean_value(login)}}}'::jsonb);""")
            
            # Insert contact if rep exists
            if rep_name and rep_email:
                contact_id = generate_uuid()
                sql_statements.append(f"""
INSERT INTO contacts (id, organization_id, first_name, last_name, email, role)
VALUES ('{contact_id}', '{org_id}', {clean_value(rep_name)}, '', {clean_value(rep_email)}, 'Sales Representative');""")
    
    return sql_statements

def import_jth_products():
    """Import JTH Products as Product Options"""
    file_path = BASE_PATH / "boards" / "2108529448_JTH Products.xlsx"
    df = pd.read_excel(file_path, engine='openpyxl')
    
    sql_statements = []
    sql_statements.append("\n-- Import JTH Products (Parts/Accessories)")
    
    for idx, row in df.iterrows():
        if idx < 2:  # Skip headers
            continue
            
        if pd.notna(row.iloc[0]) and row.iloc[0] not in ['Horse Area', 'Name']:
            option_id = generate_uuid()
            name = row.iloc[0]
            cost = row.iloc[1] if pd.notna(row.iloc[1]) else None
            link = row.iloc[2] if pd.notna(row.iloc[2]) else None
            quantity = row.iloc[3] if pd.notna(row.iloc[3]) else 1
            
            # Parse cost
            if cost and isinstance(cost, str):
                cost = cost.replace('£', '').replace('ex', '').replace('incl', '').strip()
                try:
                    cost = float(cost)
                except:
                    cost = 0
            
            sql_statements.append(f"""
INSERT INTO product_options (id, code, name, category, unit_price, supplier_link, quantity_per_unit)
VALUES ('{option_id}', 'OPT-{idx:04d}', {clean_value(name)}, 'Horse Area Equipment', 
    {cost if cost else 0}, {clean_value(link)}, {quantity});""")
    
    return sql_statements

def import_workshop_jobs():
    """Import Workshop Jobs as Production Jobs"""
    file_path = BASE_PATH / "boards" / "2108506393_Workshop Jobs.xlsx"
    df = pd.read_excel(file_path, engine='openpyxl')
    
    sql_statements = []
    sql_statements.append("\n-- Import Workshop Jobs")
    
    current_job = None
    job_id = None
    
    for idx, row in df.iterrows():
        if idx < 3:  # Skip headers
            continue
            
        # Check if this is a main job (has item ID in last column)
        if pd.notna(row.iloc[8]):
            # This is a main job
            job_id = generate_uuid()
            job_name = row.iloc[0] if pd.notna(row.iloc[0]) else f"Job {idx}"
            status = row.iloc[3] if pd.notna(row.iloc[3]) else 'scheduled'
            
            # Map Monday.com status to our schema
            status_map = {
                'Working on it': 'in_progress',
                'Done': 'completed',
                'Stuck': 'blocked'
            }
            status = status_map.get(status, 'scheduled')
            
            # Extract dates
            paint_date = row.iloc[4] if pd.notna(row.iloc[4]) else None
            completion_date = row.iloc[5] if pd.notna(row.iloc[5]) else None
            
            sql_statements.append(f"""
INSERT INTO production_jobs (id, job_number, status, notes, target_date)
VALUES ('{job_id}', 'JOB-{idx:04d}', '{status}', {clean_value(job_name)}, 
    {clean_value(paint_date) if paint_date else 'NULL'});""")
            
            current_job = job_name
            
        elif pd.notna(row.iloc[1]) and job_id:
            # This is a subtask/stage
            stage_id = generate_uuid()
            stage_name = row.iloc[1]
            assigned = row.iloc[2] if pd.notna(row.iloc[2]) else None
            stage_status = row.iloc[3] if pd.notna(row.iloc[3]) else 'pending'
            
            # Map status
            status_map = {
                'Working on it': 'in_progress',
                'Done': 'completed',
                'v': 'completed'
            }
            stage_status = status_map.get(stage_status, 'pending')
            
            sql_statements.append(f"""
INSERT INTO production_stages (id, job_id, stage_name, stage_order, status, notes)
VALUES ('{stage_id}', '{job_id}', {clean_value(stage_name)}, {idx}, '{stage_status}', 
    {clean_value(assigned) if assigned else 'NULL'});""")
    
    return sql_statements

def import_team_members():
    """Import additional team members"""
    file_path = BASE_PATH / "team" / "Jthltd_team_members.xlsx"
    df = pd.read_excel(file_path, engine='openpyxl')
    
    sql_statements = []
    sql_statements.append("\n-- Import Additional Team Members")
    
    for idx, row in df.iterrows():
        if idx < 1:  # Skip header
            continue
            
        name = row.iloc[0] if pd.notna(row.iloc[0]) else None
        email = row.iloc[1] if pd.notna(row.iloc[1]) else None
        user_type = row.iloc[11] if pd.notna(row.iloc[11]) else 'workshop'
        
        if name and email:
            # Map user type to role
            role_map = {'Admin': 'admin', 'Manager': 'manager'}
            role = role_map.get(user_type, 'workshop')
            
            sql_statements.append(f"""
INSERT INTO users (email, full_name, role, department, is_active)
VALUES ({clean_value(email)}, {clean_value(name)}, '{role}', 'Operations', true)
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;""")
    
    return sql_statements

def main():
    """Generate complete import SQL"""
    all_sql = []
    
    all_sql.append("-- Monday.com Data Import")
    all_sql.append("-- Generated: " + datetime.now().isoformat())
    all_sql.append("-- This migration imports data from Monday.com export\n")
    
    # Import each dataset
    try:
        all_sql.extend(import_team_members())
    except Exception as e:
        all_sql.append(f"-- Error importing team members: {e}")
    
    try:
        all_sql.extend(import_workshop_accounts())
    except Exception as e:
        all_sql.append(f"-- Error importing workshop accounts: {e}")
    
    try:
        all_sql.extend(import_jth_products())
    except Exception as e:
        all_sql.append(f"-- Error importing products: {e}")
    
    try:
        all_sql.extend(import_workshop_jobs())
    except Exception as e:
        all_sql.append(f"-- Error importing workshop jobs: {e}")
    
    # Add sample lead and quote data
    all_sql.append("\n-- Create sample sales pipeline data")
    all_sql.append("""
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
    """)
    
    # Write to file
    with open(OUTPUT_PATH, 'w') as f:
        f.write('\n'.join(all_sql))
    
    print(f"SQL migration file created: {OUTPUT_PATH}")
    print(f"Total SQL statements: {len(all_sql)}")

if __name__ == "__main__":
    main()