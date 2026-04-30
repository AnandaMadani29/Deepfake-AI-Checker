import sys
from auth import create_reset_token

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email = sys.argv[1]
    else:
        email = input("Masukkan email: ").strip()
    
    if not email:
        print("❌ Email tidak boleh kosong!")
        sys.exit(1)
    
    try:
        token = create_reset_token(email)
        print("\n" + "=" * 80)
        print("✅ Reset token berhasil dibuat!")
        print("=" * 80)
        print(f"\nEmail: {email}")
        print(f"\nToken: {token}")
        print(f"\nReset Link:")
        print(f"http://localhost:5173/reset-password?token={token}")
        print("\n" + "=" * 80)
        print("\nToken valid selama 1 jam.")
        print("Cek email untuk link reset password, atau gunakan link di atas.")
        print("=" * 80)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
