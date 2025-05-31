import psycopg
from random import *
from os import getenv
from faker import Faker
from dotenv import load_dotenv
from datetime import datetime, timedelta
import json, traceback

# from imagedl2 import gen_img

load_dotenv()
fake = Faker()

info = f"dbname={getenv('DB_NAME')} user={getenv('DB_USER')} password={getenv('DB_PASS')}"
conn = psycopg.connect(conninfo=info)
cur = conn.cursor()

def query():
    users = list(range(1, 101))

    cur.execute("SELECT user_id, friend_id FROM friendship")
    friend_map = {u: list() for u in users}
    for u1, u2 in cur.fetchall():
        friend_map[u1].append(u2)
        friend_map[u2].append(u1)

    cur.execute("SELECT author_id,post_id from post")
    post_map = {u: list() for u in users}
    for u,p in cur.fetchall():
        post_map[u].append(p)

    for user in users:
        for post in post_map[user]:
            num_comments = choices([0,2,3,4],[75,10,8,7])[0]
            comments = set()
            while len(comments) < num_comments:
                comments.add(choice(friend_map[user]))

            for u in comments:
                cur.execute(
                    '''
                    INSERT INTO post_comment(post_id, author_id, content)
                    VALUES(%s,%s,%s)
                    RETURNING comment_id
                    ''',(post,u,fake.paragraph()[:50],)
                )
                comment_id = cur.fetchone()[0]

                notification = ['post_comment', user, u, json.dumps({"post": post, "comment":comment_id})]
                cur.execute(
                    '''
                    INSERT INTO notification(type, recipient_id, sender_id, metadata)
                    VALUES(%s,%s,%s,%s)
                    ''', (*notification,)
                )

                if choices([0,1],[90,10])[0] == 0:
                    continue

                commenter = choice(friend_map[user])
                cur.execute(
                    '''
                    INSERT INTO post_comment(post_id, author_id, content, parent_comment_id)
                    VALUES(%s,%s,%s,%s)
                    RETURNING comment_id
                    ''',(post,commenter,fake.paragraph()[:50],comment_id)
                )
                comment_id = cur.fetchone()[0]

                notification = ['post_comment', user, commenter, json.dumps({"post": post, "comment":comment_id})]
                cur.execute(
                    '''
                    INSERT INTO notification(type, recipient_id, sender_id, metadata)
                    VALUES(%s,%s,%s,%s)
                    ''', (*notification,)
                )


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
