import psycopg
from random import *
from os import getenv
from faker import Faker
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json, traceback
from collections import defaultdict

load_dotenv()
fake = Faker()

info = f"dbname={getenv('DB_NAME')} user={getenv('DB_USER')} password={getenv('DB_PASS')}"
conn = psycopg.connect(conninfo=info)
cur = conn.cursor()

depts = ['CSE', 'EEE', 'ME', 'CE', 'BME', 'ChE', 'MME', 'IPE', 'NCE', 'NAME', 'WRE', 'ARC', 'URP']
codes = ['05', '06', '10', '04', '18', '02', '11', '08', '17', '12', '16', '01', '15']

dept_map = {depts[i]: codes[i] for i in range(len(depts))}

def query():
    cur.execute('SELECT user_id,student_id,department FROM "user" ORDER BY user_id')
    for user, id, dept in cur.fetchall():
        new_id = id[:2] + dept_map[dept] + id[4:]
        cur.execute('UPDATE "user" SET student_id=%s WHERE user_id=%s',(new_id,user,))

try:
    query()
    conn.commit()
    print('Insertion Successful')

except Exception as e:
    conn.rollback()
    print('Insertion Failed: ')
    traceback.print_exc()

cur.close()
conn.close()
