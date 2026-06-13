from passlib.context import CryptContext
import passlib.handlers.bcrypt

ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = ctx.hash("testpassword")
print(f"passlib+bcrypt OK. Hash sample: {hashed[:30]}...")
