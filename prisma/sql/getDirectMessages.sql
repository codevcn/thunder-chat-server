-- @param {String} $1:msgTime
-- @param {Int} $2:directChatId
-- @param {Int} $3:limit

SELECT
    id,
    author_id AS "authorId",
    content AS "content",
    created_at AS "createdAt",
    "status" AS "status",
    direct_chat_id AS "directChatId"
FROM direct_messages
WHERE
    created_at < $1::TIMESTAMP
    AND direct_chat_id = $2::INTEGER
ORDER BY created_at DESC
LIMIT $3::INTEGER