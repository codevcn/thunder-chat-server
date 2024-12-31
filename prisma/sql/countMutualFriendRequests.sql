WITH
    user_friendships AS (
        -- Danh sách bạn bè của user cụ thể
        SELECT
            CASE
                WHEN sender_id = $1 THEN recipient_id
                ELSE sender_id
            END AS friend_id
        FROM friend
        WHERE
            $1 IN (sender_id, recipient_id)
    ),
    sender_friends AS (
        -- Danh sách bạn bè của người gửi trong mỗi lời mời
        SELECT
            fr.id AS request_id,
            fr.sender_id,
            fr.recipient_id,
            CASE
                WHEN f.sender_id = fr.sender_id THEN f.recipient_id
                ELSE f.sender_id
            END AS sender_friend_id
        FROM friend_request fr
            LEFT JOIN friend f ON fr.sender_id IN (f.sender_id, f.recipient_id)
        WHERE
            fr.recipient_id = $1 -- User nhận lời mời
    ),
    mutual_friends AS (
        -- Danh sách bạn chung giữa user và sender
        SELECT sf.request_id, sf.sender_id, sf.recipient_id, sf.sender_friend_id
        FROM
            sender_friends sf
            JOIN user_friendships uf ON sf.sender_friend_id = uf.friend_id
    )
SELECT
    sf.request_id,
    sf.sender_id,
    sf.recipient_id,
    pr.avatar,
    pr.full_name,
    COUNT(DISTINCT mf.sender_friend_id) AS mutual_friends_count
FROM
    sender_friends sf
    LEFT JOIN mutual_friends mf ON sf.request_id = mf.request_id
    LEFT JOIN "profile" pr ON pr.user_id = sf.sender_id
GROUP BY
    sf.request_id,
    sf.sender_id,
    sf.recipient_id,
    pr.avatar,
    pr.full_name
ORDER BY sf.request_id;