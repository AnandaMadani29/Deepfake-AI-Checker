import os
from dotenv import load_dotenv
from email_service import send_reset_email

load_dotenv()

print("=" * 50)
print("Testing Email Configuration")
print("=" * 50)
print(f"SMTP_EMAIL: {os.getenv('SMTP_EMAIL')}")
print(f"SMTP_SERVER: {os.getenv('SMTP_SERVER')}")
print(f"SMTP_PORT: {os.getenv('SMTP_PORT')}")
print(f"FRONTEND_URL: {os.getenv('FRONTEND_URL')}")
print("=" * 50)
print()

# GANTI dengan email Anda untuk test!
test_email = input("Masukkan email untuk test (atau Enter untuk skip): ").strip()

if test_email:
    print(f"\nMengirim test email ke: {test_email}")
    print("Tunggu sebentar...")
    
    try:
        result = send_reset_email(
            to_email=test_email,
            reset_token="test-token-123456",
            user_name="Test User"
        )
        
        if result:
            print("\n✅ Email berhasil dikirim!")
            print(f"Cek inbox: {test_email}")
            print("(Jangan lupa cek spam folder juga!)")
        else:
            print("\n❌ Email gagal dikirim")
            print("Cek apakah SMTP credentials sudah benar")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("Test email di-skip")
