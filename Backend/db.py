import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="parking_pool",
            pool_size=10,
            host=str(os.getenv("DB_HOST", "localhost")),
            port=int(os.getenv("DB_PORT", 3306)),
            user=str(os.getenv("DB_USER", "root")),
            password=str(os.getenv("DB_PASSWORD", "3008")),  # must be str, never int
            database=str(os.getenv("DB_NAME", "parking_db")),
            autocommit=True,
        )
    return _pool


def get_db():
    return get_pool().get_connection()


def query(sql, params=None, fetchone=False):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        if fetchone:
            return cursor.fetchone()
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def execute(sql, params=None):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params or ())
        conn.commit()
        return cursor.lastrowid, cursor.rowcount
    finally:
        cursor.close()
        conn.close()


def call_proc(proc_name, args):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc(proc_name, args)
        conn.commit()
        results = []
        for r in cursor.stored_results():
            results.extend(r.fetchall())
        return results, cursor.fetchwarnings()
    finally:
        cursor.close()
        conn.close()
