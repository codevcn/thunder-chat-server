-- @param {Int} $1:myselfId
-- @param {Int} $2:friendId

SELECT COUNT(f.id) as "mutualFriends"
FROM friends f
WHERE
    f.sender_id = $2
    AND f.recipient_id IN (
        SELECT fr.recipient_id
        FROM friends fr
        WHERE
            fr.sender_id = $1
    );