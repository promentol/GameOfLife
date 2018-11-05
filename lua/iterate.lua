local prefix = KEYS[1]
local height = tonumber(ARGV[1])
local width = tonumber(ARGV[2])

local neighbors = {
    {1, 1},
    {1, -1},
    {1, 0},
    {0, 1},
    {0, -1},
    {-1, -1},
    {-1, 0},
    {-1, 1},
}

for i=1,height do
    for j=1,width do

        local count = 0
        local sum_r = 0
        local sum_g = 0
        local sum_b = 0
        local live = redis.call("HEXISTS", prefix.."_GAMEOFLIFE_DATA", i..":"..j..":".."r")

        for k=1,8 do
            local x = i+neighbors[k][1]
            local y = j+neighbors[k][2]
            if x >= 1 and x<=height and y>=1 and y<=width then
                local link_id = redis.call("HEXISTS", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."r")
                if link_id == 1 then
                    count = count + 1
                    sum_r = sum_r + redis.call("HGET", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."r")
                    sum_g = sum_g + redis.call("HGET", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."g")
                    sum_b = sum_b + redis.call("HGET", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."b")
                end
            end
        end

        if live == 0 then
            if count == 3 then
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", i)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", j)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", sum_r/count)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", sum_g/count)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", sum_b/count)
            end
        else
            if count < 2 then
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", i)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", j)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", -1)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", -1)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", -1)
            end
            if count > 3 then
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", i)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", j)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", -1)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", -1)
                redis.call("RPUSH", prefix.."_GAMEOFLIFE_QUEUE", -1)
            end
        end
    end
end

while redis.call("LLEN", prefix.."_GAMEOFLIFE_QUEUE") > 0 do
    local x = redis.call("LPOP", prefix.."_GAMEOFLIFE_QUEUE")
    local y = redis.call("LPOP", prefix.."_GAMEOFLIFE_QUEUE")
    local r = redis.call("LPOP", prefix.."_GAMEOFLIFE_QUEUE")
    local g = redis.call("LPOP", prefix.."_GAMEOFLIFE_QUEUE")
    local b = redis.call("LPOP", prefix.."_GAMEOFLIFE_QUEUE")

    if r == "-1" then
        redis.call("HDEL", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."r")
        redis.call("HDEL", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."g")
        redis.call("HDEL", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."b")
    else
        redis.call("HSET", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."r", r)
        redis.call("HSET", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."g", g)
        redis.call("HSET", prefix.."_GAMEOFLIFE_DATA", x..":"..y..":".."b", b)
    end
end

redis.call("PUBLISH", prefix.."_GAMEOFLIFE_CHANNEL", 1)