import psycopg2
try:
    conn = psycopg2.connect("postgresql://postgres.jzvhjnjhqqldtfzspqtn:SMARThub@1122@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres")
    cur = conn.cursor()
    cur.execute("SELECT id, resource_name, start_time, end_time, status FROM bookings WHERE resource_name ILIKE '%Main Auditorium%'")
    rows = cur.fetchall()
    print("BOOKINGS FOR MAIN AUDITORIUM:")
    for row in rows:
        print(f"ID: {row[0]}, Resource: {row[1]}, Start: {row[2]}, End: {row[3]}, Status: {row[4]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
