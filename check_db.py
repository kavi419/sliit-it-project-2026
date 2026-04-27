import psycopg2
try:
    conn = psycopg2.connect("postgresql://postgres.jzvhjnjhqqldtfzspqtn:SMARThub@1122@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres")
    cur = conn.cursor()
    cur.execute("SELECT id, name, status FROM resources")
    rows = cur.fetchall()
    print("RESOURCES IN DB:")
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, Status: {row[2]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
