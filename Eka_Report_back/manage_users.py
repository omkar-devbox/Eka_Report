"""
EKA Report - SQLite User Manager CLI & Interactive Tool
Allows adding, listing, updating, and removing users from the SQLite auth database.
"""

import sys
import os
import argparse
import sqlite3

# Add current directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.auth_db import get_auth_db
    from app.core.security import get_password_hash
except ImportError as err:
    print(f"Error importing application modules: {err}")
    print("Please make sure you are running this script from the 'Eka_Report_back' directory.")
    sys.exit(1)


def print_table(rows, headers):
    """Print data in a beautifully aligned ASCII table."""
    if not rows:
        print("No users found.")
        return
    
    # Calculate column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(val if val is not None else "")))

    # Format line separator
    sep = "+" + "+".join("-" * (w + 2) for w in col_widths) + "+"
    print(sep)
    
    # Format header row
    header_str = "|" + "|".join(f" {str(headers[i]).ljust(col_widths[i])} " for i in range(len(headers))) + "|"
    print(header_str)
    print(sep)
    
    # Format data rows
    for row in rows:
        row_str = "|" + "|".join(f" {str(row[i] if row[i] is not None else '').ljust(col_widths[i])} " for i in range(len(row))) + "|"
        print(row_str)
    print(sep)


def cli_list_users():
    """List all users in the SQLite database."""
    conn = get_auth_db()
    try:
        rows = conn.execute(
            "SELECT id, username, email, full_name, role, is_active, created_at FROM users"
        ).fetchall()
        
        headers = ["ID", "Username", "Email", "Full Name", "Role", "Active", "Created At"]
        table_rows = []
        for row in rows:
            table_rows.append([
                row["id"],
                row["username"],
                row["email"],
                row["full_name"],
                row["role"],
                "Yes" if row["is_active"] else "No",
                row["created_at"]
            ])
            
        print(f"\nTotal users: {len(rows)}")
        print_table(table_rows, headers)
    except Exception as e:
        print(f"Error listing users: {e}")
    finally:
        conn.close()


def cli_add_user_func(username, email, full_name, password, role="viewer", active=1):
    """Add a new user to the SQLite database."""
    if not username or not email or not full_name or not password:
        print("Error: Username, email, full name, and password are required.")
        return False

    conn = get_auth_db()
    try:
        # Check duplicate username
        exists_u = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if exists_u:
            print(f"Error: Username '{username}' already exists.")
            return False

        # Check duplicate email
        exists_e = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if exists_e:
            print(f"Error: Email '{email}' already exists.")
            return False

        hashed_password = get_password_hash(password)
        conn.execute(
            """
            INSERT INTO users (username, email, full_name, hashed_password, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (username, email, full_name, hashed_password, role, active),
        )
        conn.commit()
        print(f"Success: User '{username}' successfully created.")
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False
    finally:
        conn.close()


def cli_remove_user_func(username_or_id):
    """Remove a user from the SQLite database."""
    conn = get_auth_db()
    try:
        is_id = False
        try:
            user_id = int(username_or_id)
            is_id = True
        except ValueError:
            pass

        if is_id:
            user = conn.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                print(f"Error: No user found with ID {user_id}.")
                return False
            username = user["username"]
            cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        else:
            user = conn.execute("SELECT id FROM users WHERE username = ?", (username_or_id,)).fetchone()
            if not user:
                print(f"Error: No user found with username '{username_or_id}'.")
                return False
            username = username_or_id
            cursor = conn.execute("DELETE FROM users WHERE username = ?", (username_or_id,))

        conn.commit()
        if cursor.rowcount > 0:
            print(f"Success: User '{username}' successfully removed.")
            return True
        else:
            print(f"Error: Failed to delete user '{username}'.")
            return False
    except Exception as e:
        print(f"Error removing user: {e}")
        return False
    finally:
        conn.close()


def cli_update_user_func(username_or_id, email=None, full_name=None, password=None, role=None, active=None):
    """Update a user in the SQLite database."""
    conn = get_auth_db()
    try:
        is_id = False
        try:
            user_id = int(username_or_id)
            is_id = True
        except ValueError:
            pass

        if is_id:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        else:
            user = conn.execute("SELECT * FROM users WHERE username = ?", (username_or_id,)).fetchone()

        if not user:
            print(f"Error: User '{username_or_id}' not found.")
            return False

        update_fields = []
        params = []

        if email is not None:
            # Check duplicate email
            exists = conn.execute("SELECT id FROM users WHERE email = ? AND id != ?", (email, user["id"])).fetchone()
            if exists:
                print(f"Error: Email '{email}' is already in use by another user.")
                return False
            update_fields.append("email = ?")
            params.append(email)

        if full_name is not None:
            update_fields.append("full_name = ?")
            params.append(full_name)

        if password is not None:
            hashed = get_password_hash(password)
            update_fields.append("hashed_password = ?")
            params.append(hashed)

        if role is not None:
            update_fields.append("role = ?")
            params.append(role)

        if active is not None:
            update_fields.append("is_active = ?")
            params.append(active)

        if not update_fields:
            print("No update fields provided. Nothing updated.")
            return True

        params.append(user["id"])
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
        conn.execute(query, tuple(params))
        conn.commit()
        print(f"Success: User '{user['username']}' successfully updated.")
        return True
    except Exception as e:
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()


def safe_getpass(prompt="Password: "):
    """Helper to safely get password, falling back to input() if needed."""
    import getpass
    try:
        return getpass.getpass(prompt)
    except Exception:
        return input(prompt)


def cli_interactive_add():
    """Interactive prompts to add a user."""
    print("\n--- Add New User ---")
    username = input("Username: ").strip()
    if not username:
        print("Username cannot be empty.")
        return
    email = input("Email: ").strip()
    if not email:
        print("Email cannot be empty.")
        return
    full_name = input("Full Name: ").strip()
    if not full_name:
        print("Full Name cannot be empty.")
        return
    
    password = safe_getpass("Password: ")
    if not password:
        print("Password cannot be empty.")
        return
    confirm_password = safe_getpass("Confirm Password: ")
    if password != confirm_password:
        print("Passwords do not match.")
        return
        
    role = input("Role (admin/viewer/editor) [viewer]: ").strip() or "viewer"
    if role not in ["admin", "viewer", "editor"]:
        print("Invalid role. Role must be admin, viewer, or editor.")
        return
        
    active_str = input("Is Active (y/n) [y]: ").strip().lower()
    active = 0 if active_str in ["n", "no", "0"] else 1

    cli_add_user_func(username, email, full_name, password, role, active)


def cli_interactive_remove():
    """Interactive prompts to remove a user."""
    print("\n--- Remove User ---")
    username_or_id = input("Enter Username or User ID to remove: ").strip()
    if not username_or_id:
        return
    confirm = input(f"Are you sure you want to permanently delete user '{username_or_id}'? (y/N): ").strip().lower()
    if confirm in ["y", "yes"]:
        cli_remove_user_func(username_or_id)
    else:
        print("Operation cancelled.")


def cli_interactive_update():
    """Interactive prompts to update user details."""
    print("\n--- Update User ---")
    username_or_id = input("Enter Username or User ID to update: ").strip()
    if not username_or_id:
        return

    conn = get_auth_db()
    try:
        is_id = False
        try:
            user_id = int(username_or_id)
            is_id = True
        except ValueError:
            pass

        if is_id:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        else:
            user = conn.execute("SELECT * FROM users WHERE username = ?", (username_or_id,)).fetchone()

        if not user:
            print(f"Error: User '{username_or_id}' not found.")
            return

        print(f"Found User: {user['username']} (ID: {user['id']})")
        print("Press Enter to keep current values.")

        email = input(f"New Email [{user['email']}]: ").strip() or None
        full_name = input(f"New Full Name [{user['full_name']}]: ").strip() or None

        password = None
        pw = safe_getpass("New Password [Keep current]: ")
        if pw:
            confirm = safe_getpass("Confirm New Password: ")
            if pw != confirm:
                print("Passwords do not match. Aborting update.")
                return
            password = pw

        role = input(f"New Role (admin/viewer/editor) [{user['role']}]: ").strip() or None
        if role and role not in ["admin", "viewer", "editor"]:
            print("Invalid role. Role must be admin, viewer, or editor. Aborting update.")
            return

        current_active = "y" if user["is_active"] else "n"
        active_str = input(f"Is Active (y/n) [{current_active}]: ").strip().lower()
        active = None
        if active_str:
            active = 0 if active_str in ["n", "no", "0"] else 1

        cli_update_user_func(
            username_or_id=user["id"],
            email=email,
            full_name=full_name,
            password=password,
            role=role,
            active=active
        )
    finally:
        conn.close()



def cli_seed_users_func():
    """Seed 15 users: user01 to user15, with password same as username."""
    print("Seeding 15 users (user01 to user15)...")
    success_count = 0
    for i in range(1, 16):
        username = f"user{i:02d}"
        email = f"user{i:02d}@example.com"
        full_name = f"User {i:02d}"
        password = username
        role = "viewer"
        active = 1
        # Call cli_add_user_func
        success = cli_add_user_func(
            username=username,
            email=email,
            full_name=full_name,
            password=password,
            role=role,
            active=active
        )
        if success:
            success_count += 1
    print(f"\nSeed complete: {success_count}/15 users created successfully.")


def interactive_menu():
    """Interactive prompt menu loop."""
    print("=" * 60)
    print("           EKA REPORT - SQLite User Manager           ")
    print("=" * 60)
    while True:
        print("\nAvailable Operations:")
        print("  1. List all users")
        print("  2. Add a new user")
        print("  3. Update a user")
        print("  4. Remove a user")
        print("  5. Seed 15 default users (user01 to user15)")
        print("  6. Exit")
        choice = input("\nSelect an option (1-6): ").strip()
        if choice == "1":
            cli_list_users()
        elif choice == "2":
            cli_interactive_add()
        elif choice == "3":
            cli_interactive_update()
        elif choice == "4":
            cli_interactive_remove()
        elif choice == "5":
            cli_seed_users_func()
        elif choice == "6" or choice.lower() == "exit":
            print("Goodbye!")
            break
        else:
            print("Invalid option. Please choose 1-6.")


def main():
    parser = argparse.ArgumentParser(description="Manage SQLite auth users for EKA Report backend.")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # List command
    subparsers.add_parser("list", help="List all users")

    # Add command
    parser_add = subparsers.add_parser("add", help="Add a new user")
    parser_add.add_argument("-u", "--username", required=True, help="Username")
    parser_add.add_argument("-e", "--email", required=True, help="Email address")
    parser_add.add_argument("-f", "--full-name", required=True, help="Full name")
    parser_add.add_argument("-p", "--password", required=True, help="Password (plain text, will be hashed)")
    parser_add.add_argument(
        "-r", "--role", default="viewer", choices=["admin", "viewer", "editor"], help="User role (default: viewer)"
    )
    parser_add.add_argument(
        "-a",
        "--active",
        type=int,
        choices=[0, 1],
        default=1,
        help="Is active status (1 for active, 0 for inactive, default: 1)",
    )

    # Remove command
    parser_remove = subparsers.add_parser("remove", help="Remove a user")
    parser_remove.add_argument("username_or_id", help="Username or User ID to remove")

    # Update command
    parser_update = subparsers.add_parser("update", help="Update user details")
    parser_update.add_argument("username_or_id", help="Username or User ID to update")
    parser_update.add_argument("-e", "--email", help="New email address")
    parser_update.add_argument("-f", "--full-name", help="New full name")
    parser_update.add_argument("-p", "--password", help="New password (will be hashed)")
    parser_update.add_argument("-r", "--role", choices=["admin", "viewer", "editor"], help="New user role")
    parser_update.add_argument(
        "-a", "--active", type=int, choices=[0, 1], help="New active status (1 for active, 0 for inactive)"
    )

    # Seed command
    subparsers.add_parser("seed", help="Seed 15 default users (user01 to user15)")

    args = parser.parse_args()

    if not args.command:
        # Fallback to interactive mode if no arguments are passed
        interactive_menu()
    else:
        if args.command == "list":
            cli_list_users()
        elif args.command == "add":
            cli_add_user_func(
                username=args.username,
                email=args.email,
                full_name=args.full_name,
                password=args.password,
                role=args.role,
                active=args.active
            )
        elif args.command == "remove":
            cli_remove_user_func(args.username_or_id)
        elif args.command == "update":
            cli_update_user_func(
                username_or_id=args.username_or_id,
                email=args.email,
                full_name=args.full_name,
                password=args.password,
                role=args.role,
                active=args.active
            )
        elif args.command == "seed":
            cli_seed_users_func()


if __name__ == "__main__":
    main()
