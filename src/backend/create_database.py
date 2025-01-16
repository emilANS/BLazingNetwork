from credentials_sql import user_postgresql, password_postgresql

import psycopg

# PostgreSQL database connection specifications
# Change password when project finished
conn = psycopg.connect(
    host="localhost",
    dbname="postgres",
    user=user_postgresql,
    password=password_postgresql,
    port=5432,
)

conn.autocommit = True

cur = conn.cursor()

cur.execute("CREATE DATABASE blazingdatabase")

cur.close()

conn.close()
