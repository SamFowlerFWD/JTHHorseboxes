#!/usr/bin/env python3
"""
Analyze Monday.com export data to understand structure and relationships
"""

import pandas as pd
import json
from pathlib import Path
import openpyxl

# Base path for Monday.com export
BASE_PATH = Path("/Users/samfowler/Downloads/account_30931737_data_1755775990")

def analyze_excel_file(file_path, name):
    """Analyze an Excel file and extract schema information"""
    print(f"\n{'='*60}")
    print(f"Analyzing: {name}")
    print('='*60)
    
    try:
        # Read Excel file
        df = pd.read_excel(file_path, engine='openpyxl')
        
        # Basic statistics
        print(f"Total Rows: {len(df)}")
        print(f"Total Columns: {len(df.columns)}")
        print(f"\nColumn Names and Types:")
        print("-" * 40)
        
        for col in df.columns:
            non_null = df[col].notna().sum()
            dtype = str(df[col].dtype)
            unique_vals = df[col].nunique()
            print(f"  - {col}")
            print(f"    Type: {dtype}, Non-null: {non_null}/{len(df)}, Unique: {unique_vals}")
            
            # Show sample values for key columns
            if unique_vals < 20 and non_null > 0:
                sample_values = df[col].dropna().unique()[:5]
                print(f"    Sample values: {list(sample_values)}")
        
        # Show first few rows
        print(f"\nFirst 3 rows preview:")
        print("-" * 40)
        print(df.head(3).to_string())
        
        # Identify potential relationships
        if 'Item ID' in df.columns or 'ID' in df.columns:
            id_col = 'Item ID' if 'Item ID' in df.columns else 'ID'
            print(f"\nPrimary Key: {id_col}")
            
        # Look for foreign keys (columns ending with ID or containing 'link')
        potential_fks = [col for col in df.columns if 
                        ('ID' in col or 'link' in col.lower() or 'ref' in col.lower())]
        if potential_fks:
            print(f"\nPotential Foreign Keys: {potential_fks}")
            
        return df
        
    except Exception as e:
        print(f"Error analyzing {name}: {e}")
        return None

def main():
    """Main analysis function"""
    print("JTH Monday.com Data Analysis Report")
    print("="*60)
    
    # Analyze Workshop Jobs board
    workshop_jobs_path = BASE_PATH / "boards" / "2108506393_Workshop Jobs.xlsx"
    workshop_jobs_df = analyze_excel_file(workshop_jobs_path, "Workshop Jobs Board")
    
    # Analyze Workshop Accounts board  
    workshop_accounts_path = BASE_PATH / "boards" / "2108524720_Workshop accounts.xlsx"
    workshop_accounts_df = analyze_excel_file(workshop_accounts_path, "Workshop Accounts Board")
    
    # Analyze JTH Products board
    products_path = BASE_PATH / "boards" / "2108529448_JTH Products.xlsx"
    products_df = analyze_excel_file(products_path, "JTH Products Board")
    
    # Analyze Team Members
    team_path = BASE_PATH / "team" / "Jthltd_team_members.xlsx"
    team_df = analyze_excel_file(team_path, "Team Members")
    
    # Analyze Updates/Activity
    updates_path = BASE_PATH / "updates" / "2108506393_Workshop Jobs_updates.xlsx"
    updates_df = analyze_excel_file(updates_path, "Workshop Jobs Updates")
    
    # Analyze Assets (Pro 4.5 spec)
    assets_path = BASE_PATH / "assets" / "144859542_pro-45-kath-web-aug-2025-updated.xlsx"
    assets_df = analyze_excel_file(assets_path, "Pro 4.5 Specifications")
    
    # Generate schema relationships summary
    print("\n" + "="*60)
    print("SCHEMA RELATIONSHIPS SUMMARY")
    print("="*60)
    
    print("\nIdentified Entities:")
    print("1. Workshop Jobs - Production tracking with stages")
    print("2. Workshop Accounts - Customer/deal information")
    print("3. JTH Products - Product catalog")
    print("4. Team Members - User management")
    print("5. Updates - Activity logs and comments")
    print("6. Product Specifications - Detailed model specs")
    
    print("\nWorkflow Stages Detected:")
    if workshop_jobs_df is not None and 'Status' in workshop_jobs_df.columns:
        statuses = workshop_jobs_df['Status'].dropna().unique()
        print(f"  Production Stages: {list(statuses)}")
    
    if workshop_accounts_df is not None and 'Status' in workshop_accounts_df.columns:
        statuses = workshop_accounts_df['Status'].dropna().unique()
        print(f"  Sales Pipeline Stages: {list(statuses)}")

if __name__ == "__main__":
    main()