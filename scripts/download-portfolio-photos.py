#!/usr/bin/env python3
"""
Download portfolio photos from Google Drive

Usage:
  python3 download-portfolio-photos.py kitchens   # Download kitchen photos
  python3 download-portfolio-photos.py decks      # Download deck photos
  python3 download-portfolio-photos.py all        # Download both
"""

import json
import os
import sys
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# Configuration
SERVICE_ACCOUNT_PATH = '/Users/greghutzell/.openclaw/workspace/hphomesatl-service-account.json'
FRONTEND_ROOT = '/Users/greghutzell/.openclaw/workspace/hp-home-improvements-app/frontend/public/sample-photos'
PHOTO_TYPES = {
    'kitchens': {'folder_name': 'Kitchens', 'prefix': 'kitchen'},
    'decks': {'folder_name': 'Decks', 'prefix': 'deck'},
}

def authenticate():
    """Authenticate with Google Drive API"""
    with open(SERVICE_ACCOUNT_PATH) as f:
        service_account_info = json.load(f)
    
    credentials = Credentials.from_service_account_info(
        service_account_info,
        scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    return build('drive', 'v3', credentials=credentials)

def find_folder(service, folder_name):
    """Find a folder by name in Google Drive"""
    results = service.files().list(
        q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        spaces='drive',
        pageSize=1,
        fields='files(id, name)'
    ).execute()
    
    folders = results.get('files', [])
    if not folders:
        return None
    return folders[0]['id']

def list_images(service, folder_id):
    """List all images in a folder"""
    image_mimetypes = ['image/jpeg', 'image/png', 'image/webp']
    query = f"'{folder_id}' in parents and trashed=false and ("
    query += " or ".join([f"mimeType='{mime}'" for mime in image_mimetypes])
    query += ")"
    
    results = service.files().list(
        q=query,
        spaces='drive',
        pageSize=100,
        fields='files(id, name, mimeType, size)',
        orderBy='name'
    ).execute()
    
    return results.get('files', [])

def download_photo(service, file_id, output_path):
    """Download a single photo from Google Drive"""
    request = service.files().get_media(fileId=file_id)
    file_handle = io.BytesIO()
    downloader = MediaIoBaseDownload(file_handle, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    data = file_handle.getvalue()
    
    # Verify it's not an error response
    if data.startswith(b'<!DOCTYPE') or data.startswith(b'<html'):
        return False, "Got HTML response (likely auth error)"
    
    # Write the file
    with open(output_path, 'wb') as f_out:
        f_out.write(data)
    
    return True, len(data)

def download_portfolio_type(photo_type):
    """Download photos for a specific portfolio type (kitchens/decks)"""
    if photo_type not in PHOTO_TYPES:
        print(f"❌ Unknown photo type: {photo_type}")
        print(f"   Available: {', '.join(PHOTO_TYPES.keys())}")
        return False
    
    config = PHOTO_TYPES[photo_type]
    folder_name = config['folder_name']
    prefix = config['prefix']
    
    print(f"📸 Downloading {folder_name} photos...")
    
    # Authenticate
    service = authenticate()
    
    # Find folder
    folder_id = find_folder(service, folder_name)
    if not folder_id:
        print(f"❌ Folder '{folder_name}' not found in Google Drive")
        print(f"   Create a folder named '{folder_name}' and add photos to it")
        return False
    
    print(f"✅ Found {folder_name} folder")
    
    # List images
    files = list_images(service, folder_id)
    if not files:
        print(f"❌ No images found in '{folder_name}' folder")
        return False
    
    print(f"✅ Found {len(files)} images")
    
    # Create output directory
    os.makedirs(FRONTEND_ROOT, exist_ok=True)
    
    # Clean existing files of this type
    for f in os.listdir(FRONTEND_ROOT):
        if f.startswith(f"{prefix}_"):
            os.remove(os.path.join(FRONTEND_ROOT, f))
    
    # Download first 20 images
    success_count = 0
    for idx, file in enumerate(files[:20], 1):
        try:
            output_path = os.path.join(FRONTEND_ROOT, f'{prefix}_{idx}.jpg')
            success, result = download_photo(service, file['id'], output_path)
            
            if success:
                size_mb = result / (1024*1024)
                print(f"✅ {prefix}_{idx}.jpg ({size_mb:.2f} MB) - {file['name']}")
                success_count += 1
            else:
                print(f"❌ {prefix}_{idx}.jpg: {result}")
        except Exception as e:
            print(f"❌ {prefix}_{idx}.jpg: {e}")
    
    print(f"\n✅ Downloaded {success_count}/{min(20, len(files))} {folder_name} photos")
    return success_count > 0

def main():
    if len(sys.argv) < 2:
        photo_types = ['kitchens', 'decks', 'all']
        print("Usage: python3 download-portfolio-photos.py [type]")
        print(f"Types: {', '.join(photo_types)}")
        return False
    
    photo_type = sys.argv[1].lower()
    
    if photo_type == 'all':
        kitchens_ok = download_portfolio_type('kitchens')
        decks_ok = download_portfolio_type('decks')
        return kitchens_ok or decks_ok
    else:
        return download_portfolio_type(photo_type)

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
