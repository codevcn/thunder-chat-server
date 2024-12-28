-- $1 is ourself id (senderId), $2 is friend id (recipientId)
SELECT COUNT(f.id) as "mutualFriends"
FROM "Friend" f
WHERE
    f."senderId" = $2
    AND f."recipientId" IN (
        SELECT fr."recipientId"
        FROM "Friend" fr
        WHERE
            fr."senderId" = $1
    );