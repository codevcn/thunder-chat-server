-- $1 is ourself id (senderId), $2 is friend id (recipientId)
SELECT COUNT(f.id) as "mutualFriends"
FROM friend f
WHERE
    f.sender_id = $2
    AND f.recipient_id IN (
        SELECT fr.recipient_id
        FROM friend fr
        WHERE
            fr.sender_id = $1
    );