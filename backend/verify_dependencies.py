#!/usr/bin/env python3
"""
Dependency Verification Script for KisanSaathi Backend
Checks if all required packages are installed and importable
"""

import sys
from typing import List, Tuple

def check_imports() -> Tuple[List[str], List[str]]:
    """Check if all required packages can be imported."""
    
    required_imports = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('pydantic', 'Pydantic'),
        ('numpy', 'NumPy'),
        ('pandas', 'Pandas'),
        ('sklearn', 'scikit-learn'),
        ('scipy', 'SciPy'),
        ('joblib', 'Joblib'),
        ('pulp', 'PuLP (Linear Programming)'),
        ('dotenv', 'python-dotenv'),
        ('multipart', 'python-multipart'),
    ]
    
    success = []
    failed = []
    
    print("🔍 Checking Dependencies...\n")
    print("=" * 60)
    
    for module, name in required_imports:
        try:
            __import__(module)
            print(f"✅ {name:30} OK")
            success.append(name)
        except ImportError as e:
            print(f"❌ {name:30} MISSING")
            failed.append(name)
    
    print("=" * 60)
    print(f"\n📊 Results: {len(success)}/{len(required_imports)} packages installed\n")
    
    return success, failed

def check_versions():
    """Display versions of key packages."""
    print("\n📦 Package Versions:\n")
    print("=" * 60)
    
    packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'numpy',
        'pandas',
        'sklearn',
        'pulp'
    ]
    
    for package in packages:
        try:
            mod = __import__(package)
            version = getattr(mod, '__version__', 'Unknown')
            print(f"  {package:20} {version}")
        except ImportError:
            print(f"  {package:20} NOT INSTALLED")
    
    print("=" * 60)

def check_models():
    """Check if ML models exist."""
    import os
    
    print("\n🤖 ML Models Check:\n")
    print("=" * 60)
    
    models_dir = './models'
    expected_models = [
        'crop_prediction_model.pkl',
        'crop_label_encoder.pkl',
        'yield_prediction_model.pkl'
    ]
    
    if not os.path.exists(models_dir):
        print(f"⚠️  Models directory not found: {models_dir}")
        print("   Run training scripts to generate models.")
        return
    
    for model in expected_models:
        path = os.path.join(models_dir, model)
        if os.path.exists(path):
            size = os.path.getsize(path) / 1024  # KB
            print(f"✅ {model:35} ({size:.2f} KB)")
        else:
            print(f"❌ {model:35} MISSING")
    
    print("=" * 60)

def main():
    """Main verification function."""
    print("\n" + "=" * 60)
    print("  KisanSaathi Backend - Dependency Verification")
    print("=" * 60 + "\n")
    
    # Check imports
    success, failed = check_imports()
    
    # Check versions
    check_versions()
    
    # Check models
    try:
        check_models()
    except Exception as e:
        print(f"\n⚠️  Error checking models: {e}")
    
    # Final status
    print("\n" + "=" * 60)
    if failed:
        print("❌ VERIFICATION FAILED")
        print(f"\nMissing packages: {', '.join(failed)}")
        print("\n💡 Install missing packages:")
        print("   pip install -r requirements.txt")
        print("=" * 60)
        sys.exit(1)
    else:
        print("✅ ALL DEPENDENCIES VERIFIED")
        print("\n🚀 Backend is ready for deployment!")
        print("=" * 60)
        sys.exit(0)

if __name__ == "__main__":
    main()
