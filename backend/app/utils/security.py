import bcrypt

# Password ko Hash (Encrypt) karne ke liye
def get_password_hash(password):
    # Password ko bytes mein convert karo
    pwd_bytes = password.encode('utf-8')
    # Salt add karke hash karo
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    # Wapas string bana kar bhejo
    return hashed_password.decode('utf-8')

# Password check karne ke liye (Login ke time)
def verify_password(plain_password, hashed_password):
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)