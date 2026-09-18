#!/usr/bin/env python3
import hashlib
import base64
import getpass
import re
from pathlib import Path

ENV_FILE = Path(__file__).parent / "backend" / ".env"

password = getpass.getpass("New password: ")
confirm  = getpass.getpass("Confirm password: ")

if password != confirm:
    print("Passwords do not match.")
    raise SystemExit(1)

hash_b64 = base64.b64encode(hashlib.sha256(password.encode()).digest()).decode()

content = ENV_FILE.read_text()
new_content, n = re.subn(r"^PASSWORD_HASH=.*$", f"PASSWORD_HASH={hash_b64}", content, flags=re.MULTILINE)

if n == 0:
    print(f"PASSWORD_HASH not found in {ENV_FILE} — appending.")
    new_content = content.rstrip("\n") + f"\nPASSWORD_HASH={hash_b64}\n"

ENV_FILE.write_text(new_content)
print("Password updated.")
