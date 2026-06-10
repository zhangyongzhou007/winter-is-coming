package com.winteriscoming.util;

/**
 * 雪花算法 ID 生成器
 * 生成 64 位唯一 ID：1位符号 + 41位时间戳 + 5位数据中心 + 5位机器 + 12位序列号
 */
public class SnowflakeIdGenerator {

    /** 起始时间戳（2026-01-01 00:00:00） */
    private static final long START_TIMESTAMP = 1767225600000L;

    /** 机器ID位数 */
    private static final long WORKER_ID_BITS = 5L;
    /** 数据中心ID位数 */
    private static final long DATACENTER_ID_BITS = 5L;
    /** 序列号位数 */
    private static final long SEQUENCE_BITS = 12L;

    /** 最大机器ID */
    private static final long MAX_WORKER_ID = ~(-1L << WORKER_ID_BITS);
    /** 最大数据中心ID */
    private static final long MAX_DATACENTER_ID = ~(-1L << DATACENTER_ID_BITS);

    /** 机器ID左移位数 */
    private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;
    /** 数据中心ID左移位数 */
    private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
    /** 时间戳左移位数 */
    private static final long TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS;
    /** 序列号掩码 */
    private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);

    private final long workerId;
    private final long datacenterId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    public SnowflakeIdGenerator(long workerId, long datacenterId) {
        if (workerId > MAX_WORKER_ID || workerId < 0) {
            throw new IllegalArgumentException("workerId 超出范围: " + workerId);
        }
        if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
            throw new IllegalArgumentException("datacenterId 超出范围: " + datacenterId);
        }
        this.workerId = workerId;
        this.datacenterId = datacenterId;
    }

    /**
     * 生成唯一ID
     */
    public synchronized long nextId() {
        long timestamp = System.currentTimeMillis();

        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨，拒绝生成ID，回拨毫秒数: " + (lastTimestamp - timestamp));
        }

        if (timestamp == lastTimestamp) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            if (sequence == 0) {
                timestamp = waitNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - START_TIMESTAMP) << TIMESTAMP_SHIFT)
                | (datacenterId << DATACENTER_ID_SHIFT)
                | (workerId << WORKER_ID_SHIFT)
                | sequence;
    }

    private long waitNextMillis(long lastTimestamp) {
        long timestamp = System.currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = System.currentTimeMillis();
        }
        return timestamp;
    }
}
